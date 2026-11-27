import type { Metadata } from "next";
import {
  Caveat,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sofia_Sans_Extra_Condensed,
  Yuji_Mai,
} from "next/font/google";
import localFont from "next/font/local";
import { ACTIVE_THEME } from "@/constants";
import "./globals.css";

const blackMustang = localFont({
  // next/font/local resolves relative to this file — /public is NOT a valid root for src
  src: "../public/Black_Mustang.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-mustang",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const yujiMai = Yuji_Mai({
  subsets: ["latin"],
  weight: "400",
  preload: false,
  variable: "--font-shodo",
  display: "swap",
});

const posterFont = Sofia_Sans_Extra_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-poster",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yash Mishra — Full-Stack & AI Engineer",
  description:
    "Architecting scalable enterprise platforms, cross-platform mobile apps, and production agentic AI systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${posterFont.variable} ${blackMustang.variable} ${instrumentSerif.variable} ${caveat.variable} ${jetbrainsMono.variable} ${yujiMai.variable} h-full antialiased`}
    >
      <body
        style={{
          backgroundColor: ACTIVE_THEME.bg,
          color: ACTIVE_THEME.textPrimary,
        }}
        className="font-[family-name:var(--font-sans)] antialiased transition-colors duration-300"
      >
        {children}
      </body>
    </html>
  );
}
