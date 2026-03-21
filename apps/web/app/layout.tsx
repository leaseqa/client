import "@/app/globals.css";
import "@/app/refresh.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import AppChrome from "@/components/layout/app-chrome";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LeaseQA",
  description:
    "AI-assisted lease review and legal Q&A platform for Boston renters.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${dmSerif.variable}`}
      >
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
