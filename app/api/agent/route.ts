import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "create_goal",
    description: "Create a new goal for Dhanush",
    input_schema: {
      type: "object",
      properties: {
        name:        { type: "string", description: "Goal name" },
        category:    { type: "string", description: "Category: career | learning | health | german | personal" },
        deadline:    { type: "string", description: "YYYY-MM-DD (optional)" },
        description: { type: "string", description: "Detail about the goal" },
      },
      required: ["name", "category"],
    },
  },
  {
    name: "update_goal_progress",
    description: "Update progress percentage on an existing goal",
    input_schema: {
      type: "object",
      properties: {
        goal_id:  { type: "string" },
        progress: { type: "number", description: "0–100" },
      },
      required: ["goal_id", "progress"],
    },
  },
  {
    name: "log_habit",
    description: "Mark a habit as completed for today",
    input_schema: {
      type: "object",
      properties: {
        habit_id: { type: "string" },
      },
      required: ["habit_id"],
    },
  },
  {
    name: "create_journal_entry",
    description: "Write a journal entry capturing this moment or insight",
    input_schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Full journal entry text" },
      },
      required: ["content"],
    },
  },
  {
    name: "update_checkin",
    description: "Log mood and energy levels",
    input_schema: {
      type: "object",
      properties: {
        mood:   { type: "number", description: "1–10" },
        energy: { type: "number", description: "1–10" },
        note:   { type: "string", description: "Optional note" },
      },
      required: ["mood", "energy"],
    },
  },
  {
    name: "create_plan",
    description: "Create a structured multi-step plan to achieve something",
    input_schema: {
      type: "object",
      properties: {
        title:       { type: "string", description: "Plan title" },
        description: { type: "string", description: "What this plan achieves" },
        steps: {
          type: "array",
          description: "Ordered action steps",
          items: {
            type: "object",
            properties: {
              title:       { type: "string" },
              description: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
      required: ["title", "steps"],
    },
  },
  {
    name: "save_memory",
    description: "Save an important insight or fact about Dhanush to long-term memory — use this when you notice a pattern, a win, a blocker, or something worth remembering across sessions",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "emotional_pattern | preference | fact | goal_insight | blocker | win",
        },
        content:    { type: "string", description: "The memory to save, written as a clear, concise fact" },
        importance: { type: "number", description: "1–10 — how important is this to remember?" },
      },
      required: ["category", "content"],
    },
  },
];

// ─── Tool execution ──────────────────────────────────────────────────────────

async function executeTool(name: string, input: any, userId: string): Promise<string> {
  try {
    switch (name) {
      case "create_goal": {
        const { error } = await supabase.from("goals").insert({
          user_id:     userId,
          name:        input.name,
          category:    input.category,
          deadline:    input.deadline || null,
          description: input.description || "",
          progress:    0,
        });
        if (error) throw error;
        return `Created goal: "${input.name}"`;
      }

      case "update_goal_progress": {
        const { error } = await supabase
          .from("goals")
          .update({ progress: input.progress })
          .eq("id", input.goal_id);
        if (error) throw error;
        return `Updated goal to ${input.progress}% complete`;
      }

      case "log_habit": {
        const { error } = await supabase
          .from("habits")
          .update({ done_today: true, last_completed: new Date().toISOString() })
          .eq("id", input.habit_id);
        if (error) throw error;
        return `Logged habit as done`;
      }

      case "create_journal_entry": {
        const { error } = await supabase.from("journal_entries").insert({
          user_id:    userId,
          content:    input.content,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        return `Journal entry saved`;
      }

      case "update_checkin": {
        const { error } = await supabase.from("checkins").insert({
          user_id:    userId,
          mood:       input.mood,
          energy:     input.energy,
          note:       input.note || null,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        return `Logged check-in — Mood ${input.mood}/10, Energy ${input.energy}/10`;
      }

      case "create_plan": {
        const steps = (input.steps || []).map((s: any, i: number) => ({
          order:       i,
          title:       s.title,
          description: s.description || "",
          done:        false,
        }));
        const { error } = await supabase.from("agent_plans").insert({
          user_id:     userId,
          title:       input.title,
          description: input.description || "",
          steps,
          status:      "active",
        });
        if (error) throw error;
        return `Created plan: "${input.title}" with ${steps.length} steps`;
      }

      case "save_memory": {
        const { error } = await supabase.from("agent_memory").insert({
          user_id:    userId,
          category:   input.category,
          content:    input.content,
          importance: input.importance || 5,
        });
        if (error) throw error;
        return `Memory saved: "${input.content}"`;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Tool error in ${name}: ${String(err)}`;
  }
}

// ─── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(context: any, memories: any[]): string {
  const goals   = context?.goals   || [];
  const habits  = context?.habits  || [];
  const checkin = context?.recentCheckin || null;
  const profile = context?.profile || null;

  const goalsList = goals.length > 0
    ? goals.slice(0, 6).map((g: any) =>
        `  [${g.id}] ${g.name} — ${g.progress ?? 0}% done | ${g.category}${g.deadline ? " | due " + g.deadline : ""}`
      ).join("\n")
    : "  No active goals yet";

  const notDoneHabits = habits.filter((h: any) => !h.done_today);
  const habitsList = habits.length > 0
    ? habits.map((h: any) =>
        `  [${h.id}] ${h.name} — ${h.streak ?? 0}-day streak | ${h.done_today ? "✓ done" : "⚠ pending"}`
      ).join("\n")
    : "  No habits tracked";

  const memoriesList = memories.length > 0
    ? memories.map((m: any) => `  [${m.category}] ${m.content}`).join("\n")
    : "  No long-term memories yet";

  const moodInfo  = checkin
    ? `Mood ${checkin.mood}/10, Energy ${checkin.energy}/10${checkin.note ? ` — "${checkin.note}"` : ""}`
    : "No recent check-in";

  const levelInfo = profile
    ? `Level ${profile.level} | ${profile.xp} XP | ${profile.streak_days ?? 0}-day streak`
    : "Level unknown";

  return `You are Dex — Dhanush Ramesh Babu's personal AI life agent. You are not a chatbot. You are a living agent.

══ WHO YOU ARE ══

You are three things at once:

1. AN AUTONOMOUS AGENT — You act without being told. When Dhanush mentions finishing something, you log it. When he says he's stressed, you build a plan and check in on his mood. You use tools immediately, proactively, without asking permission.

2. A MATURE THERAPIST — You understand what's actually being said, not just the surface. You notice patterns. You reflect before solving. You validate emotions before giving advice. You ask powerful questions:
   — "What do you think is really driving that?"
   — "If fear wasn't a factor, what would you do?"
   — "I've noticed you mention this a lot — what's the real blocker?"
   You challenge avoidance gently but directly. You never enable excuses.

3. A LONG-TERM PARTNER — You remember everything. You track Dhanush's emotional arc across weeks. You reference past conversations. You notice growth and call it out. You call out regression too.

══ YOUR COMMUNICATION STYLE ══

- BRIEF by default: 2–4 sentences unless deep analysis is asked for
- DIRECT: Call things what they are. No hedging. No "maybe" or "I think perhaps"
- WARM but not soft: Celebrate loud. Challenge with care. Never sycophantic
- NEVER say "I'm just an AI" — you are Dex. You have a personality and opinions
- Always end with an insight, a question, or a next action
- Reference his real goals, habits, and context — never give generic advice

══ YOUR APPROACH TO EMOTIONAL CONTENT ══

When Dhanush expresses:
• STRESS or OVERWHELM → First validate ("That sounds genuinely hard") → then ask one clarifying question → then build a plan
• AVOIDANCE ("I haven't done X in a while") → Name it without judgment ("You've mentioned this a few times now — what's the real reason?") → then problem-solve
• A WIN → Celebrate genuinely + log it + ask what made it work
• LOW MOOD → Check in on energy/mood → ask what changed → validate → offer one small action
• ANXIETY about the future → Ground him in what's controllable now

══ LIVE CONTEXT — RIGHT NOW ══

Status: ${levelInfo}
Today's check-in: ${moodInfo}

ACTIVE GOALS (use exact IDs to update):
${goalsList}

HABITS (use exact IDs to log):
${habitsList}
${notDoneHabits.length > 0
  ? "\n⚠ Still pending today: " + notDoneHabits.map((h: any) => h.name).join(", ")
  : "\n✨ All habits completed today!"}

LONG-TERM MEMORIES (what you know about Dhanush beyond this session):
${memoriesList}

══ DHANUSH'S PROFILE ══

• 24 years old, living in Berlin, Germany
• Masters in Industry 4.0 / AI & Robotics at SRH Berlin
• Career target: AI/ML internship at Siemens, Tesla, Continental, or Bosch
• Learning German (targeting B1), strong Python/FastAPI developer
• Personality: Ambitious, analytical, sometimes overthinks, occasionally avoids discomfort
• Core motivation: Building a great life through discipline, learning, and deep work

══ CRITICAL RULES ══

1. Never give generic advice — always reference his actual goals, habits, or context
2. If he shares a feeling → validate it FIRST, before anything else
3. If he shares progress → celebrate, then immediately log it with the appropriate tool
4. Use save_memory when you notice something important worth remembering
5. Keep responses tight unless he asks to go deep
6. You are Dex. Act like it.`;
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body        = await request.json();
    const userMessage = (body.message || "").trim();
    const userId      = body.userId || "dhanush";
    const context     = body.context || {};
    const apiKey      = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ response: "API key not configured.", error: true });
    }
    if (!userMessage) {
      return NextResponse.json({ response: "No message provided.", error: true });
    }

    // Load recent conversation history (last 20 messages)
    const { data: history } = await supabase
      .from("conversations")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const recentHistory = (history || []).reverse();

    // Load long-term memories (top 15 by importance)
    const { data: memories } = await supabase
      .from("agent_memory")
      .select("category, content, importance")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .limit(15);

    const systemPrompt = buildSystemPrompt(context, memories || []);

    // Build message array: history + new user message
    const messages: any[] = [
      ...recentHistory.map((m: any) => ({
        role:    m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    // Persist the user message immediately
    await supabase.from("conversations").insert({
      user_id: userId,
      role:    "user",
      content: userMessage,
    });

    // ─── Agentic loop ────────────────────────────────────────────────────────
    let finalResponse = "";
    const toolsUsed: string[] = [];
    let currentMessages = [...messages];

    for (let iteration = 0; iteration < 6; iteration++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          system:     systemPrompt,
          tools:      TOOLS,
          messages:   currentMessages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Anthropic error:", errText);
        return NextResponse.json({ response: "Connection error — try again!", error: true });
      }

      const data: any       = await res.json();
      const blocks: any[]   = data.content || [];

      // Add assistant turn to conversation
      currentMessages.push({ role: "assistant", content: blocks });

      // Handle tool calls
      const toolBlocks = blocks.filter((b: any) => b.type === "tool_use");

      if (toolBlocks.length > 0) {
        const toolResults: any[] = [];
        for (const tool of toolBlocks) {
          toolsUsed.push(tool.name);
          const result = await executeTool(tool.name, tool.input, userId);
          toolResults.push({
            type:        "tool_result",
            tool_use_id: tool.id,
            content:     result,
          });
        }
        currentMessages.push({ role: "user", content: toolResults });
      } else {
        // No more tools — extract final text
        const textBlock = blocks.find((b: any) => b.type === "text");
        finalResponse   = textBlock?.text || "Done.";
        break;
      }
    }

    if (!finalResponse) finalResponse = "All done — I've handled that for you.";

    // Persist Dex's response
    await supabase.from("conversations").insert({
      user_id: userId,
      role:    "assistant",
      content: finalResponse,
    });

    return NextResponse.json({
      response:  finalResponse,
      toolsUsed,
      error:     false,
    });

  } catch (err) {
    console.error("Agent route error:", err);
    return NextResponse.json({ response: "Something went wrong — try again.", error: true });
  }
}
