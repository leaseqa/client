"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import HeaderBar from "@/components/navigation/HeaderBar";
import { shouldHideGlobalChrome } from "@/app/chrome";

export { shouldHideGlobalChrome } from "@/app/chrome";

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideGlobalChrome = shouldHideGlobalChrome(pathname);

  return (
    <div className="app-shell d-flex min-vh-100 flex-column">
      <div className="flex-grow-1 d-flex flex-column content-shell">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {!hideGlobalChrome ? <HeaderBar /> : null}

        <main
          id="main-content"
          className="flex-grow-1 d-flex flex-column"
          style={{ minHeight: 0 }}
        >
          <div className="page-shell flex-grow-1 d-flex flex-column">
            {children}
          </div>
        </main>

        {!hideGlobalChrome ? (
          <footer className="site-footer py-3 px-4 small">
            LeaseQA gives legal information for renters. It is not a law firm
            and it is not legal advice.
          </footer>
        ) : null}
      </div>
    </div>
  );
}
