import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
import MobileTabs from "./components/MobileTabs";
import InstallPrompt from "./components/InstallPrompt";
import SWRegister from "./components/SWRegister";
const spaceGrotesk = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  interactiveWidget: "resizes-content" as const,
  themeColor: "#0d0b09",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://g100-eight.vercel.app"),
  title: "G100 - A Group of Visionary Leaders",
  description:
    "At first glance, an eagle. On closer look, a hundred leaders. Vision. Leadership. Unity.",
  openGraph: {
    title: "G100 - A Group of Visionary Leaders",
    description:
      "At first glance, an eagle. On closer look, a hundred leaders.",
    url: "https://g100-eight.vercel.app",
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
        <ToastProvider>
        <SmoothScroll />
        <Navbar />
        <MobileTabs />
        <InstallPrompt />
        <SWRegister />
        {children}
        </ToastProvider>
      </body>
    </html>
  );
}










