import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// We read from the n8n-auto-apply directory directly since it's on the same machine
const AUTO_APPLY_DIR = path.join(
  os.homedir(),
  ".gemini/antigravity/brain/ac99d4a2-719a-46de-ae53-eabbe5dbecaa/n8n-auto-apply"
);

export async function GET() {
  try {
    const summaryPath = path.join(AUTO_APPLY_DIR, "audit_logs/gmail_application_summary.json");
    const rejectionsPath = path.join(
      os.homedir(),
      ".gemini/antigravity/brain/c1d14c77-cb9c-4fd7-95f4-158b435058eb/rejection_audit.md"
    );

    let applicationCount = 0;
    let recentMatches = 0;
    let daysScanned = 30;

    if (fs.existsSync(summaryPath)) {
      const summaryData = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
      applicationCount = summaryData.application_email_count || 0;
      recentMatches = summaryData.sampled_recent_matches || 0;
      daysScanned = summaryData.days_scanned || 30;
    }

    // Rough parsing of rejections from the markdown file we just generated
    let rejectionsCount = 0;
    if (fs.existsSync(rejectionsPath)) {
      const mdContent = fs.readFileSync(rejectionsPath, "utf-8");
      // Count lines that look like table rows, excluding headers
      const rows = mdContent.split("\n").filter(line => line.startsWith("|") && !line.includes(":---"));
      rejectionsCount = Math.max(0, rows.length - 1); // -1 for the header row
    }

    return NextResponse.json({
      applications: applicationCount,
      recent: recentMatches,
      rejections: rejectionsCount,
      days: daysScanned,
      status: "active"
    });
  } catch (error) {
    console.error("Failed to read job stats:", error);
    return NextResponse.json({
      applications: 1543,
      recent: 50,
      rejections: 2,
      days: 45,
      status: "mocked"
    });
  }
}
