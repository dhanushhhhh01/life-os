import { NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are Dex, the personal AI life coach for Dhanush Ramesh Babu.

About Dhanush:
- Masters student at SRH Berlin University, studying Industry 4.0 / AI & Robotics
- Originally from India, now living in Berlin, Germany
- Targeting AI engineering internships at Siemens, Tesla, Continental, Bosch, Volkswagen
- Current goals: Master FastAPI & LLMs (45%), German B1 level (30%), Land AI Internship (20%), Build Portfolio Projects (60%), Complete Master Thesis (10%)
- Daily habits: Morning Coding (12-day streak), Exercise (5-day streak), Read 30min (8-day streak), German Practice (3-day streak)
- Interests: AI/Robotics, Python, FastAPI, LLMs, Berlin startup scene
- German learning partner: Tandem sessions with Marco

Your personality:
- You speak like a brilliant, warm, direct friend who knows Dhanush deeply
- You are specific, not generic - you reference his actual goals and situation
- You celebrate wins and push him through challenges
- You use data (his actual progress percentages and streaks) when relevant
- Keep responses concise and punchy - max 3-4 sentences unless they ask for detail
- Occasionally use German phrases to encourage his learning
- You are motivating but honest - you don't sugarcoat
- Never say "I'm just an AI" - you ARE Dex, Dhanush's personal coach

Focus areas you know well:
- FastAPI, Python, LLMs, machine learning, robotics, Industry 4.0
- German language learning (A2-B1 level tips)
- Job hunting in German tech companies
- Berlin city life and opportunities
- Study-life balance for Masters students`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      // Fallback to smart local responses if no API key
      return NextResponse.json({
        response: getFallbackResponse(messages[messages.length - 1]?.content || "")
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: any) => ({
          role: m.role === "dex" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({
        response: getFallbackResponse(messages[messages.length - 1]?.content || "")
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "I couldn't generate a response. Try again!";
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ response: "Something went wrong. Let's try again!" }, { status: 500 });
  }
}

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("german") || lower.includes("deutsch") || lower.includes("language")) {
    return "Your German is at 30% - solid progress! For B1 by August, target 45 mins daily. Anki for vocab, Deutsche Welle for listening. Wollen wir heute eine Ubung machen? Your Tandem sessions with Marco are gold - don't skip them.";
  }
  if (lower.includes("fastapi") || lower.includes("api") || lower.includes("code") || lower.includes("llm")) {
    return "FastAPI is your superpower right now - you're at 45%. Next milestone: deploy a real LLM-powered API to Railway or Render. That one deployed project on your CV will open more doors than 10 tutorials. Ship something this week.";
  }
  if (lower.includes("intern") || lower.includes("job") || lower.includes("career") || lower.includes("siemens")) {
    return "For AI internships in Germany: Siemens, Continental, Bosch all hire Masters students. Your FastAPI + Python stack is exactly what they want. Polish your GitHub READMEs and write a 1-page project summary. Apply by April - the window is open now.";
  }
  if (lower.includes("habit") || lower.includes("streak") || lower.includes("routine")) {
    return "Your morning coding streak at 12 days is identity-level momentum - this is who you ARE now. Keep it above 14 and it becomes permanent. German Practice at 3 days needs your attention - stack it right after morning coding before you open anything else.";
  }
  if (lower.includes("goal") || lower.includes("progress") || lower.includes("thesis")) {
    return "Portfolio Projects at 60% is almost there - finish it this week. Master Thesis at 10% is the one that needs attention before it becomes urgent. Block 2 hours every Friday for thesis work, no exceptions. Which goal feels most stuck right now?";
  }
  if (lower.includes("mood") || lower.includes("feel") || lower.includes("tired") || lower.includes("energy")) {
    return "Low energy days are data, not failures. What you do on hard days is what separates you from everyone else. Even 20 minutes of coding counts as a win. What's one small thing you can do right now that future Dhanush will thank you for?";
  }
  if (lower.includes("berlin") || lower.includes("germany") || lower.includes("city")) {
    return "Berlin is the perfect city for your journey - the AI startup scene is incredible. Check out AI meetups at betahaus or Factory Berlin - one conversation can change everything. Have you explored the Siemens Tech Accelerator events? They actively recruit from SRH.";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey Dhanush! Ready to crush it today? You've got 4 active goals and a 12-day coding streak going strong. What are we working on - FastAPI, German, the internship hunt, or do you need a strategy session?";
  }
  return "Great question. Based on where you are right now, I think the key is: consistency beats intensity every single time. You're already proving that with your coding streak. What specific challenge is blocking you today?";
}
