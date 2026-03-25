import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life OS | Your Personal Second Brain",
  description: "AI-powered personal dashboard for goals, mood, habits, and life coaching",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a1a] min-h-screen">{children}</body>
    </html>
  );
}
