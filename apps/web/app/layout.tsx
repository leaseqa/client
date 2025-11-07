import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { MainNav } from "@/components/navigation/MainNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeaseQA",
  description: "AI-assisted lease review and legal Q&A platform for Boston renters.",
};

function LegalDisclaimer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--nav-bg)] px-4 py-4 text-xs text-slate-400">
      LeaseQA provides legal information and does not constitute formal legal advice. Consult a licensed
      attorney for case-specific guidance.
    </footer>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[var(--app-bg)] text-slate-100 antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-white/10 bg-[var(--header-bg)] text-slate-100 shadow-lg shadow-black/20">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--pill-bg)] text-lg font-semibold text-white shadow-inner shadow-black/10">
                      CS
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">CS 5610 · Fall 25</p>
                      <p className="text-base font-semibold">LeaseQA · Piazza-inspired Workspace</p>
                    </div>
                  </div>
                  <div className="hidden flex-1 items-center gap-3 md:flex">
                    <div className="flex flex-1 items-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-200 backdrop-blur">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="mr-2 h-4 w-4 text-slate-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                      <input
                        className="flex-1 bg-transparent text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none"
                        placeholder="Search posts, folders, people"
                      />
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs text-slate-200 backdrop-blur">
                      151 unread
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <ThemeToggle />
                    <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20">
                      Create update
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--avatar-start)] to-[var(--avatar-end)] text-sm font-semibold text-slate-900 shadow-inner shadow-black/20">
                      YC
                    </div>
                  </div>
                </div>
              </div>
              <MainNav />
            </header>
            <main className="flex-1 bg-transparent">{children}</main>
            <LegalDisclaimer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
