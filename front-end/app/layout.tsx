import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPT-5 Coding Examples",
  description: "Example apps coded by GPT-5",
  icons: {
    icon: "/gpt-5.png",
  },
  openGraph: {
    images: ["/gpt-5.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/gpt-5.png"],
    title: "GPT-5 Coding Examples",
    description: "Example apps coded by GPT-5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
