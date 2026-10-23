import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAIT · Anonymous Ask Us Anything — Live Spatial Experience",
  description:
    "Student Association of Information Technology (SAIT) GIM session interactive Q&A experience. Ask anything anonymously from your phone.",
  keywords: [
    "SAIT",
    "Student Association of Information Technology",
    "Ask Us Anything",
    "GIM",
    "Interactive Q&A",
  ],
};

export const viewport: Viewport = {
  themeColor: "#F5F1E7",
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
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="bg-ivory text-charcoal font-sans antialiased selection:bg-citrus selection:text-charcoal min-h-screen">
        {children}
      </body>
    </html>
  );
}
