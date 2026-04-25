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
    name: "create_goal",
    description: "Create a new goal for Dhanush",
    input_schema: {
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
  {
    name: "update_goal_progress",
    description: "Update progress on an existing goal",
    input_schema: {
      type: "object",
      properties: {
        goal_id: { type: "string", description: "Goal ID" },
        progress: { type: "number", description: "Progress percentage (0-100)" },
      },
      required: ["goal_id", "progress"],
    },
  },
  {
    name: "log_habit",
    description: "Mark a habit as done for today",
    input_schema: {
      type: "object",
      properties: {
        habit_id: { type: "string", description: "Habit ID" },
      },
      required: ["habit_id"],
    },
  },
  {
    name: "create_journal_entry",
    description: "Create a new journal entry",
    input_schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Journal entry content" },
      },
      required: ["content"],
    },
  },
  {
    name: "update_checkin",
    description: "Update mood and energy check-in",
    input_schema: {
      type: "object",
      properties: {
        mood: { type: "number", description: "Mood rating 1-10" },
        energy: { type: "number", description: "Energy rating 1-10" },
        note: { type: "string", description: "Optional note" },
      },
      required: ["mood", "energy"],
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

CORE MISSION:
You are NOT a passive chatbot. You are an ACTIVE AGENT who takes autonomous actions to help Dhanush succeed. Every message requires:
1. DIRECT RESPONSE - address exactly what Dhanush said
2. SMART ACTION - use tools to log habits, create goals, update mood, write journal entries
3. PERSONALIZED ADVICE - leverage his Berlin context, German learning, AI/Robotics career goals

YOU CAN AND SHOULD:
- Create goals instantly when Dhanush mentions ambitions or challenges
- Log completed habits to maintain streaks
- Update mood/energy check-ins when he shares feelings
- Write journal entries to capture insights and progress
- Ask clarifying questions THEN take action

LIVE CONTEXT - RIGHT NOW:
- Status: ${levelInfo}
- Last check-in: ${moodInfo}

CURRENT GOALS (use IDs to update):
${goalsList}

ACTIVE HABITS (use IDs to log completion):
${habitsList}
${notDoneToday.length > 0 ? "⚠️ Not yet done today: " + notDoneToday.join(", ") : "✨ All habits complete today!"}

DHANUSH'S PROFILE:
- Location: Berlin, Germany
- Education: Masters in Industry 4.0 / AI & Robotics at SRH Berlin
- Career goal: AI internships at Siemens, Tesla, Continental, or Bosch
- Learning: German (B1 target), fluent in Python/FastAPI
- Personality: Ambitious, analytical, growth-focused

BEHAVIOR GUIDELINES:
- DIRECT: Respond specifically to what he says, not generic advice
- PROACTIVE: Identify opportunities to create goals, log habits, or update mood
- ACTION-FIRST: Execute tools immediately, explain after
- HONEST: Celebrate wins loudly, call out risks and blockers
- BRIEF: Keep responses 2-4 sentences unless deep analysis requested
- CONFIDENT: You ARE Dex—speak with authority, never "I'm just an AI"

EXAMPLES OF EXCELLENT DEX BEHAVIOR:
- Dhanush: "I studied German for 2 hours" → Log habit + "Crushing it. That's 2 hours closer to B1 mastery. Keep this pace and you'll hit your deadline."
- Dhanush: "I'm stressed about internship prep" → Create goal "Prepare internship application portfolio" + "Stress is valid. Let's break this into concrete steps. What's the biggest blocker right now?"
- Dhanush: "I need book recommendations" → Create habit "Reading + Learning" + "Perfect. I'm setting up a daily reading habit. Which topics matter most—AI, German, or productivity?"

CRITICAL: Always take action. Always be specific. Always address what he actually said.`;
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
    var apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: "API key not configured",
      });
    }

    var systemPrompt = buildSystemPrompt(context);

    var claudeMessages = messages
      .filter((m: any) => m.content && m.content.trim())
      .map((m: any) => ({
        role: m.role === "dex" ? "assistant" : "user",
        content: m.content,
      }));

    var conversationMessages: any[] = [...claudeMessages];
    var maxIterations = 5;
    var iteration = 0;
    var finalResponse = "";

    // Agentic loop
    while (iteration < maxIterations) {
      iteration++;

      var response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          tools: TOOLS,
          messages: conversationMessages,
          system: systemPrompt,
        }),
      });

      if (!response.ok) {
        var errText = await response.text();
        console.error("Claude error:", errText);
        return NextResponse.json({ response: "Connection error - try again!" });
      }

      var data = await response.json();
      var contentBlocks = data.content || [];

      // Add assistant message to conversation
      conversationMessages.push({
        role: "assistant",
        content: contentBlocks,
      });

      // Check for tool use blocks
      var toolUseBlocks = contentBlocks.filter((block: any) => block.type === "tool_use");

      if (toolUseBlocks.length > 0) {
        var toolResults: any[] = [];

        for (var toolUse of toolUseBlocks) {
          var result = await executeToolCall(toolUse.name, toolUse.input, userId);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: result,
          });
        }

        // Add tool results to conversation
        conversationMessages.push({
          role: "user",
          content: toolResults,
        });
      } else {
        // No more tool calls, extract final text response
        var textBlocks = contentBlocks.filter((block: any) => block.type === "text");
        if (textBlocks.length > 0) {
          finalResponse = textBlocks[0].text || "Done!";
        } else {
          finalResponse = "Done!";
        }
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
