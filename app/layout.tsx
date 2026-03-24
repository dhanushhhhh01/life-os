import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Life OS",
    description: "Life OS Application",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
          <html lang="en">
                <body>{children}</body>body>
          </html>html>
        );
}</html>
