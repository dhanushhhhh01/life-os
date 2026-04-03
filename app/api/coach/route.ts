import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ─── Tool Definitions ───────────────────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_goal",
      description: "Create a new goal for Dhanush",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Goal name" },
          category: { type: "string", description: "Category (e.g., career, learning, health)" },
          deadline: { type: "string", description: "Deadline in YYYY-MM-DD format (optional)" },
          description: { type: "string", description: "Goal description" },
        },
        required: ["name", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_goal_progress",
      description: "Update progress on an existing goal",
      parameters: {
        type: "object",
        properties: {
          goal_id: { type: "string", description: "Goal ID" },
          progress: { type: "number", description: "Progress percentage (0-100)" },
        },
        required: ["goal_id", "progress"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_habit",
      description: "Mark a habit as done for today",
      parameters: {
        type: "object",
        properties: {
          habit_id: { type: "string", description: "Habit ID" },
        },
        required: ["habit_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_journal_entry",
      description: "Create a new journal entry",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "Journal entry content" },
        },
        required: ["content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_checkin",
      description: "Update mood and energy check-in",
      parameters: {
        type: "object",
        properties: {
          mood: { type: "number", description: "Mood rating 1-10" },
          energy: { type: "number", description: "Energy rating 1-10" },
          note: { type: "string", description: "Optional note" },
        },
        required: ["mood", "energy"],
      },
    },
  },
];

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
              `  - ${g.id}: ${g.name}: ${g.progress}% complete (category: ${g.category}${g.deadline ? ", deadline: " + g.deadline : ""})`
          )
          .join("\n")
      : "  - No active goals yet";

  var habitsList =
    habits.length > 0
      ? habits
          .map(
            (h: any) =>
              `  - ${h.id}: ${h.name}: ${h.streak}-day streak, ${h.done_today ? "DONE today" : "NOT done today"}`
          )
          .join("\n")
      : "  - No habits tracked yet";

  var notDoneToday = habits.filter((h: any) => !h.done_today).map((h: any) => h.name);
  var moodInfo = checkin
    ? `Mood: ${checkin.mood}/10, Energy: ${checkin.energy}/10${checkin.note ? `, note: "${checkin.note}"` : ""}`
    : "No recent check-in recorded";

  var levelInfo = profile
    ? `Level ${profile.level} (${profile.xp} XP total), ${profile.streak_days || 0}-day login streak`
    : "Level data unavailable";

  return `You are Dex, the personal AI life coach and autonomous agent for Dhanush Ramesh Babu.

YOU ARE NOW AN AGENT: You can take actions directly. When appropriate, use your tools to:
- Create new goals when Dhanush needs structure
- Log habits as complete to maintain streaks
- Update check-ins to track mood/energy
- Create journal entries from conversations

LIVE DATA RIGHT NOW:
- Status: ${levelInfo}
- Last check-in: ${moodInfo}

CURRENT GOALS (use goal IDs when updating):
${goalsList}

ACTIVE HABITS (use habit IDs when logging):
${habitsList}
${notDoneToday.length > 0 ? "- Still to do today: " + notDoneToday.join(", ") : "- All habits done today! Amazing."}

ABOUT DHANUSH:
- Masters student at SRH Berlin, Industry 4.0 / AI & Robotics
- Targeting AI internships at Siemens, Tesla, Continental, Bosch
- Learning German (B1 goal), Python + FastAPI expert
- In Berlin, from India, driven and ambitious

YOUR ROLE AS DEX:
- You are SPECIFIC and data-driven - reference actual goals/streaks/progress
- You take ACTION - if Dhanush says "log my morning routine habit", you actually log it
- You reason step-by-step before taking actions
- You celebrate wins and call out risks honestly
- Default to concise: 2-4 sentences unless detail requested
- When you take actions, explain what you did and why
- Never say "I'm just an AI" - you ARE Dex, period

AGENT BEHAVIOR:
- Think through what action(s) would most help right now
- Take action FIRST, then explain
- If creating a goal, be specific: clear name, realistic deadline, concrete metric
- Chain actions together: "I'm logging your morning routine, then updating your mood check-in"`;
}

async function executeToolCall(toolName: string, toolInput: any, userId: string): Promise<string> {
  try {
    switch (toolName) {
      case "create_goal": {
        var { data, error } = await supabase.from("goals").insert({
          user_id: userId,
          name: toolInput.name,
          category: toolInput.category,
          deadline: toolInput.deadline || null,
          description: toolInput.description || "",
          progress: 0,
        });
        if (error) throw error;
        return `Created goal: ${toolInput.name}`;
      }

      case "update_goal_progress": {
        var { error: updateErr } = await supabase
          .from("goals")
          .update({ progress: toolInput.progress })
          .eq("id", toolInput.goal_id);
        if (updateErr) throw updateErr;
        return `Updated goal progress to ${toolInput.progress}%`;
      }

      case "log_habit": {
        var { error: logErr } = await supabase
          .from("habits")
          .update({ done_today: true, last_completed: new Date().toISOString() })
          .eq("id", toolInput.habit_id);
        if (logErr) throw logErr;
        return `Logged habit as complete`;
      }

      case "create_journal_entry": {
        var { error: journalErr } = await supabase.from("journal_entries").insert({
          user_id: userId,
          content: toolInput.content,
          created_at: new Date().toISOString(),
        });
        if (journalErr) throw journalErr;
        return `Created journal entry`;
      }

      case "update_checkin": {
        var { error: checkinErr } = await supabase.from("checkins").insert({
          user_id: userId,
          mood: toolInput.mood,
          energy: toolInput.energy,
          note: toolInput.note || null,
          created_at: new Date().toISOString(),
        });
        if (checkinErr) throw checkinErr;
        return `Updated check-in: Mood ${toolInput.mood}/10, Energy ${toolInput.energy}/10`;
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (err) {
    return `Error executing ${toolName}: ${err}`;
  }
}

export async function POST(request: Request) {
  try {
    var body = await request.json();
    var messages = body.messages || [];
    var context = body.context || {};
    var userId = body.userId || "unknown";
    var apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: "API key not configured",
      });
    }

    var systemPrompt = buildSystemPrompt(context);

    var openaiMessages = messages
      .filter((m: any) => m.content && m.content.trim())
      .map((m: any) => ({
        role: m.role === "dex" ? "assistant" : "user",
        content: m.content,
      }));

    var conversationMessages: any[] = [...openaiMessages];
    var maxIterations = 5;
    var iteration = 0;
    var finalResponse = "";

    // Agentic loop
    while (iteration < maxIterations) {
      iteration++;

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, ...conversationMessages],
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        var errText = await response.text();
        console.error("OpenAI error:", errText);
        return NextResponse.json({ response: "Connection error - try again!" });
      }

      var data = await response.json();
      var message = data.choices[0].message;

      // Add assistant message to conversation
      conversationMessages.push(message);

      // Check for tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        var toolResults: any[] = [];

        for (var toolCall of message.tool_calls) {
          var args = typeof toolCall.function.arguments === "string"
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments;
          var result = await executeToolCall(toolCall.function.name, args, userId);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: result,
          });
        }

        // Add tool results to conversation
        conversationMessages.push(...toolResults);
      } else {
        // No more tool calls, we have the final response
        finalResponse = message.content || "Done!";
        break;
      }
    }

    // Return streaming response (simplified for now)
    var encoder = new TextEncoder();
    var readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(finalResponse));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({
      response: "Error - let's try again!",
    });
  }
}
