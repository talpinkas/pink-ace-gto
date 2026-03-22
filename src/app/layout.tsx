import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pink Ace GTO Trainer",
  description: "Professional poker GTO training - Master preflop ranges and postflop decisions",
  keywords: ["poker", "GTO", "trainer", "preflop", "ranges", "postflop"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
