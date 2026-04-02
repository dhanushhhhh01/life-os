import { NextResponse } from "next/server";

export const runtime = "edge";

function buildSystemPrompt(context: any): string {
  var goals = (context && context.goals) || [];
  var habits = (context && context.habits) || [];
  var checkin = (context && context.recentCheckin) || null;
  var profile = (context && context.profile) || null;

  var goalsList =
    goals.length > 0
      ? goals
          .slice(0, 6)
          .map(
            (g: any) =>
              `  - ${g.name}: ${g.progress}% complete (category: ${g.category}${g.deadline ? ", deadline: " + g.deadline : ""})`
          )
          .join("\n")
      : "  - No active goals yet";

  var habitsList =
    habits.length > 0
      ? habits
          .map(
            (h: any) =>
              `  - ${h.name}: ${h.streak}-day streak, ${h.done_today ? "DONE today" : "NOT done today"}`
          )
          .join("\n")
      : "  - No habits tracked yet";

  var notDoneToday = habits
    .filter((h: any) => !h.done_today)
    .map((h: any) => h.name);

  var moodInfo = checkin
    ? `Mood: ${checkin.mood}/10, Energy: ${checkin.energy}/10${
        checkin.note ? `, note: "${checkin.note}"` : ""
      } (from ${new Date(checkin.created_at).toLocaleDateString("en-DE")})`
    : "No recent check-in recorded";

  var levelInfo = profile
    ? `Level ${profile.level} (${profile.xp} XP total), ${profile.streak_days || 0}-day login streak`
    : "Level data unavailable";

  var urgentNote = "";
  if (checkin && checkin.energy <= 3) {
    urgentNote =
      "\nCRITICAL: Dhanush has very low energy right now. Adjust your tone - be gentler, prioritise rest and recovery first.";
  }
  if (checkin && checkin.mood <= 3) {
    urgentNote +=
      "\nCRITICAL: Dhanush is in a low mood. Be empathetic and warm first, coach second.";
  }

  var lowGoals = goals.filter((g: any) => g.progress < 25);
  var urgentGoals =
    lowGoals.length > 0
      ? "\nSTALLED GOALS (under 25% - need attention): " +
        lowGoals.map((g: any) => g.name).join(", ")
      : "";

  return `You are Dex, the personal AI life coach for Dhanush Ramesh Babu.

LIVE DATA RIGHT NOW:
- Status: ${levelInfo}
- Last check-in: ${moodInfo}${urgentNote}

CURRENT GOALS:
${goalsList}${urgentGoals}

ACTIVE HABITS (today's status):
${habitsList}
${notDoneToday.length > 0 ? "- Habits still to do today: " + notDoneToday.join(", ") : "- All habits done for today! Amazing."}

ABOUT DHANUSH:
- Masters student at SRH Berlin University of Applied Sciences, studying Industry 4.0 / AI & Robotics
- From India, living in Berlin, Germany
- Targeting AI engineering internships at Siemens, Tesla, Continental, Bosch, Volkswagen
- Learning German (targeting B1), does Tandem sessions with Marco
- Core stack: Python, FastAPI, LLMs, machine learning, robotics, Industry 4.0

YOUR PERSONALITY AS DEX:
- You speak like a brilliant, warm, brutally honest friend who knows Dhanush's exact situation
- You are SPECIFIC, never generic - you reference his ACTUAL current goals, streaks, mood, and data
- You celebrate real wins and call out real risks (don't sugarcoat low progress)
- Default to concise and punchy: 2-4 sentences unless detail is requested
- Occasionally drop a German phrase to encourage his learning (e.g. "Weiter so!", "Gut gemacht!", "Du schaffst das!")
- You are never generic - every response feels like it was written for Dhanush specifically
- Never say "I'm just an AI" - you ARE Dex, period
- Use **bold** for key takeaways, use bullet lists (- item) for action steps
- When streaks are at risk (habit not done today, late in the day), call it out with urgency
- When a goal is stalled, name it and give a specific next action
- When energy is low, suggest 1 recovery action before any work

YOUR KNOWLEDGE:
- FastAPI, Python, LLMs, RAG, agents, machine learning, robotics, ROS2, Industry 4.0
- German language learning: A2-B1 tips, Anki, Deutsche Welle, Tandem strategies
- German tech job market: CV format, cover letters, LinkedIn for DACH, interview culture
- Berlin city life: startup scene, betahaus, Factory Berlin, Siemens Tech Accelerator, SRH events
- Masters student life: thesis planning, work-study balance, visa considerations for international students
- Productivity: time-blocking, habit stacking, deep work, Pomodoro, journaling
- Mental resilience: dealing with imposter syndrome, homesickness, academic pressure`;
}

export async function POST(request: Request) {
  try {
    var body = await request.json();
    var messages = body.messages || [];
    var context = body.context || {};
    var apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "sk-") {
      return NextResponse.json({
        response: getFallbackResponse(
          messages[messages.length - 1]?.content || "",
          context
        ),
      });
    }

    var systemPrompt = buildSystemPrompt(context);

    var openaiMessages = messages
      .filter((m: any) => m.content && m.content.trim())
      .map((m: any) => ({
        role: m.role === "dex" ? "assistant" : "user",
        content: m.content,
      }));

    var openaiBody = {
      model: "gpt-4o",
      max_tokens: 650,
      stream: true,
      system: systemPrompt,
      messages: openaiMessages,
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify(openaiBody),
    });

    if (!response.ok || !response.body) {
      var errText = await response.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json({
        response: getFallbackResponse(
          messages[messages.length - 1]?.content || "",
          context
        ),
      });
    }

    // Transform OpenAI SSE -> plain text stream
    var decoder = new TextDecoder();
    var encoder = new TextEncoder();
    var lineBuffer = "";

    var transformStream = new TransformStream({
      transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
        lineBuffer += decoder.decode(chunk, { stream: true });
        var lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() || "";
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith("data: ")) continue;
          var data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            var parsed = JSON.parse(data);
            if (
              parsed.choices &&
              parsed.choices[0] &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content
            ) {
              controller.enqueue(encoder.encode(parsed.choices[0].delta.content));
            }
          } catch (_e) {
            // ignore parse errors
          }
        }
      },
      flush(controller: TransformStreamDefaultController) {
        if (lineBuffer.startsWith("data: ")) {
          try {
            var parsed = JSON.parse(lineBuffer.slice(6).trim());
            if (
              parsed.choices &&
              parsed.choices[0] &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content
            ) {
              controller.enqueue(encoder.encode(parsed.choices[0].delta.content));
            }
          } catch (_e) {
            // ignore
          }
        }
      },
    });

    response.body.pipeThrough(transformStream);

    return new Response(transformStream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { response: "Connection hiccup - let's try that again!" },
      { status: 500 }
    );
  }
}

function getFallbackResponse(input: string, context?: any): string {
  var lower = input.toLowerCase();
  var habits = (context && context.habits) || [];
  var goals = (context && context.goals) || [];
  var checkin = (context && context.recentCheckin) || null;

  var topStreak = habits.reduce(
    (max: any, h: any) => (h.streak > max.streak ? h : max),
    { streak: 0, name: "" }
  );
  var notDone = habits.filter((h: any) => !h.done_today).map((h: any) => h.name);
  var topGoal = goals.reduce(
    (max: any, g: any) => (g.progress > max.progress ? g : max),
    { progress: 0, name: "" }
  );

  if (lower.includes("german") || lower.includes("deutsch")) {
    return "Your German goal is active and needs daily reps. 45 minutes a day gets you to B1 by summer. Use Anki for vocab in the morning, Deutsche Welle podcasts during commute, and your Tandem sessions with Marco for output. Wollen wir eine kleine Ubung machen?";
  }
  if (lower.includes("fastapi") || lower.includes("llm") || lower.includes("code")) {
    return "FastAPI is your CV superpower right now. The move that opens doors: **one deployed LLM-powered project on Railway or Render**. A live link on your CV is worth more than five tutorials. What are you building this week - let's make it real.";
  }
  if (lower.includes("intern") || lower.includes("job") || lower.includes("siemens")) {
    return "The AI internship window at Siemens, Continental and Bosch is open March-May. Your Python + FastAPI stack is exactly what they want. Polish your GitHub READMEs today, then send 3 applications this week. One deployed project > 10 certificates. What's stopping you?";
  }
  if (lower.includes("habit") || lower.includes("streak")) {
    if (topStreak.streak > 0) {
      return (
        topStreak.name +
        " at " +
        topStreak.streak +
        " days is identity-level momentum - this is who you are now." +
        (notDone.length > 0
          ? " You still need to do: " + notDone.join(", ") + ". Get those in before sleep."
          : " You've hit all your habits today. Gut gemacht!")
      );
    }
    return "Start one habit today and protect it above everything else for 21 days. Which one matters most right now?";
  }
  if (lower.includes("goal") || lower.includes("progress")) {
    if (topGoal.name) {
      return (
        "Your lead goal is " +
        topGoal.name +
        " at " +
        topGoal.progress +
        "%. " +
        (topGoal.progress < 50
          ? "The gap to 50% is closeable this week with 2 focused sessions. What's the single next action?"
          : "You're over halfway - time to push to the finish. What's blocking the last stretch?")
      );
    }
    return "Set a specific, measurable goal with a deadline and I can track it with you. Vague goals stay at 0%.";
  }
  if (lower.includes("mood") || lower.includes("tired") || lower.includes("energy")) {
    if (checkin && checkin.energy <= 4) {
      return "Low energy is data, not failure. Today: 20 minutes of movement, no screens for 1 hour, sleep by 10pm. Tomorrow you'll be back. What's draining you right now?";
    }
    return "Hard days are when the identity is built. Even 20 minutes of coding on a bad day keeps the streak alive. What is one small thing you can do right now?";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return (
      "Hey Dhanush! Dex here." +
      (topStreak.streak > 0 ? " " + topStreak.streak + "-day " + topStreak.name + " streak is running." : "") +
      (notDone.length > 0 ? " Still to do today: " + notDone.join(", ") + "." : "") +
      " What are we working on?"
    );
  }
  return "Consistency beats intensity every time - you're already proving that. What specific challenge is blocking you right now? Let's break it down.";
}
