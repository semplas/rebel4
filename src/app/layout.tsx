import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Toaster } from 'react-hot-toast';
import NavigationProgress from "@/components/NavigationProgress";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awaknd Rebel - Premium Footwear",
  description: "Premium custom shoes handcrafted with quality materials",
};

  export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Add preload for critical assets */}
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <NavigationProgress />
        <Navbar />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorBoundary fallback={<div className="p-8 text-center">Something went wrong. Please refresh the page.</div>}>
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
