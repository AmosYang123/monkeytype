"use client";

import type { ReactNode } from "react";
import { CommandLineFab } from "@/components/CommandLineFab";
import { CookieModal } from "@/components/CookieModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MerchBanner } from "@/components/MerchBanner";
import { TestProvider } from "@/components/TestProvider";

/** Site chrome shared by every route; each page renders its own <main>. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TestProvider>
      <MerchBanner />
      <CookieModal />
      <CommandLineFab />
      <div
        id="app"
        className="content-grid min-h-screen grid-rows-[auto_1fr_auto] gap-y-8 pt-[calc(var(--banner-height,0px)+2rem)] pb-8"
      >
        <Header />
        {children}
        <Footer />
      </div>
    </TestProvider>
  );
}
