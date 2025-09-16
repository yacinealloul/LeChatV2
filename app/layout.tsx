export const dynamic = 'force-dynamic'
// It has solved the issue 
import NextPlausible from "next-plausible";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InteractiveBackground from "@/components/background/interactive-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Le Chat V2",
    default: "Le Chat V2 — Mistral chat with inline charts",
  },
  description: "A tiny, modern chat app powered by Mistral that can render charts directly in the conversation. Built as a friendly, non-commercial application for my SWE Mistral internship application.",
  keywords: ["chat", "AI", "Mistral", "charts", "data visualization", "web development", "internship", "Liquid Glass UI"],
  authors: [{ name: "Yacine Alloul" }],
  creator: "Yacine Alloul",
  publisher: "Yacine Alloul",
  metadataBase: new URL("https://lechatv2.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Le Chat V2 — Mistral chat with inline charts",
    description: "A tiny, modern chat app powered by Mistral that can render charts directly in the conversation. Built as a friendly, non-commercial application for my SWE Mistral internship application.",
    type: "website",
    url: "https://lechatv2.vercel.app",
    siteName: "Le Chat V2",
    images: [
      {
        url: "https://lechatv2.vercel.app/opengraph.png",
        width: 960,
        height: 540,
        alt: "Le Chat V2 - Futuristic Liquid Glass UI preview"
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Chat V2 — Mistral chat with inline charts",
    description: "A tiny, modern chat app powered by Mistral that can render charts directly in the conversation.",
    images: ["https://lechatv2.vercel.app/opengraph.png"],
    creator: "@0xmilliounaire",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextPlausible domain="lechatv2.vercel.app">
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        >
          <InteractiveBackground />
          {children}
        </body>
      </html>
    </NextPlausible>
  );
}
