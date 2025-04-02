import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DevTools from '@/components/DevTools';

// Replace Geist with Inter (widely available)
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Replace Geist_Mono with Roboto_Mono
const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awaknd Rebel - Premium Footwear",
  description: "Premium custom shoes handcrafted with quality materials",
};

export const viewport: Viewport = {
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
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-background-color`}
      >
        <Navbar />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">{children}</main>
        <Footer />
        <DevTools />
      </body>
    </html>
  );
}
