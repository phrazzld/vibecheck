import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "vibecheck - Design Aesthetic Extractor",
  description: "Transform images into detailed design aesthetic profiles",
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