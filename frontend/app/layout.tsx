import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

// Be Vietnam Pro is drawn for Vietnamese, so stacked diacritics such as
// "ặ" or "ỗ" keep their spacing, which Arial and Geist do not.
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drinkool — Đặt đồ uống tại quán",
  description: "Đặt món và thanh toán ngay tại bàn trên điện thoại.",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
};

/**
 * Root HTML layout: fonts and the app-wide providers.
 * @param props.children The route group layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnam.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
