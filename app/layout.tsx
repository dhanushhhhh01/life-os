import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life OS | Your Personal Second Brain",
  description: "AI-powered personal dashboard for goals, mood, habits, and life coaching",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050510] min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
