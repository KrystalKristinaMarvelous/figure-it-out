import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
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
      className={`${figtree.variable} ${fraunces.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
