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
  title: "Mistral Internship",
  description: "Mistral Internship",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Mistral Internship",
    description: "Mistral Internship",
    url: "https://mistral-internship.vercel.app",
    siteName: "Mistral Internship",
    images: [
      { url: "/image.png" },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <InteractiveBackground />
        {children}
      </body>
    </html>
  );
}
