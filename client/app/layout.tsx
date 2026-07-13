import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Script from "next/script";
import Footer from "@/components/Footer";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternArea",
  description: "Professional job and internship portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <LanguageProvider>
          {/* 💡 Fixed: Wrapping with LanguageProvider */}
          <div className="flex flex-col min-h-screen justify-between">
            <Navbar />

            {/* Main content page injection area */}
            <main className="grow">
              {children}
            </main>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="dark"
            />

            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}