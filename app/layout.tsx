import CartFab from "@/components/CartFab";
import Footer from "@/layouts/footer";
import Header from "@/layouts/header";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coffee Shop — Hệ thống đặt món",
  description: "Đặt món cà phê, trà, nước ép và nhiều hơn nữa tại Coffee Shop.",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* FontAwesome 6 — icons used throughout the app */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          {/* Sticky top header */}
          <Header />

          {/* Page content (grows to fill remaining height) */}
          <div className="flex-1">{children}</div>

          {/* Footer always at bottom */}
          <Footer />

          {/* Global floating cart button */}
          <CartFab />
        </Providers>
      </body>
    </html>
  );
}
