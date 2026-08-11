import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://g100.vercel.app"),
  title: "G100 - A Group of Visionary Leaders",
  description:
    "At first glance, an eagle. On closer look, a hundred leaders. Vision. Leadership. Unity.",
  openGraph: {
    title: "G100 - A Group of Visionary Leaders",
    description:
      "At first glance, an eagle. On closer look, a hundred leaders.",
    url: "https://g100.vercel.app",
    siteName: "G100",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <SmoothScroll />
        <Navbar />
        {children}
      </body>
    </html>
  );
}


