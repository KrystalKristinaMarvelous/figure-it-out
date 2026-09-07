import type { Metadata } from "next";
import {
  Inter_Tight,
  Hedvig_Letters_Serif,
  Fragment_Mono,
  Newsreader,
} from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const hedvig = Hedvig_Letters_Serif({
  variable: "--font-hedvig",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIO — figure it out first",
  description:
    "A workspace for figuring out, planning, and tracking any project. Figure it out first.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interTight.variable} ${hedvig.variable} ${fragmentMono.variable} ${newsreader.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
