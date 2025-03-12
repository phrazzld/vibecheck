import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "vibecheck - AI Style Guide Generator",
  description: "Transform images into detailed UI style guides with AI",
  applicationName: "vibecheck",
  authors: [{ name: "vibecheck", url: "https://vibecheck.design" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="fancy-background"></div>
        {children}
      </body>
    </html>
  );
}