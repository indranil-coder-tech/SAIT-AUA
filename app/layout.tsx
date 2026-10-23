import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAIT Anonymous Ask Us Anything — Spatial UI",
  description: "Live interactive anonymous Ask Us Anything session organized by Student Association of Information Technology (SAIT).",
  keywords: ["SAIT", "Student Association of Information Technology", "Ask Us Anything", "GIM", "College", "Interactive Q&A"],
  authors: [{ name: "SAIT Tech Team" }],
};

export const viewport: Viewport = {
  themeColor: "#060913",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midnight-950 text-slate-100 antialiased selection:bg-cyber-violet selection:text-white">
        {children}
      </body>
    </html>
  );
}
