import "@/app/globals.css";
import "@/app/refresh.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import HeaderBar from "@/components/navigation/HeaderBar";

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
          <div className="app-shell d-flex min-vh-100 flex-column">
            <div className="flex-grow-1 d-flex flex-column content-shell">
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <HeaderBar />

              <main
                id="main-content"
                className="flex-grow-1 d-flex flex-column"
                style={{ minHeight: 0 }}
              >
                <div className="page-shell flex-grow-1 d-flex flex-column">
                  {children}
                </div>
              </main>

              <footer className="site-footer py-3 px-4 small">
                LeaseQA gives legal information for renters. It is not a law
                firm and it is not legal advice.
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
