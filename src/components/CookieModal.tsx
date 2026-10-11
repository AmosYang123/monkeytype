"use client";

import { useEffect, useState } from "react";
import { Fa } from "@/components/icons";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "cookieConsent";

const buttonClass =
  "flex w-full cursor-pointer items-center justify-center gap-2 rounded p-2 leading-5 transition-[color,background,opacity] duration-125 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-text hover:text-bg";

export function CookieModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = "unavailable";
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: don't nag
    }
    // reading storage can only happen after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === null) setOpen(true);
  }, []);

  if (!open) return null;

  const choose = (choice: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="fixed inset-0 z-[1000] flex items-end justify-end bg-black/50 p-8">
      <div className="grid w-full max-w-[500px] gap-4 rounded-[16px] bg-bg p-4 text-text ring-4 ring-sub-alt sm:p-8">
        <h3 id="cookie-title" className="flex items-center gap-[0.5em] text-2xl text-sub">
          <Fa icon="cookie-bite" fw={false} />
          We use cookies by the way
        </h3>
        <div className="grid gap-4">
          <div>Cookies enhance your experience and help us improve our website.</div>
          <div className="grid gap-2">
            <button type="button" className={cn(buttonClass, "bg-main text-bg")} onClick={() => choose("all")}>
              accept all
            </button>
            <button type="button" className={cn(buttonClass, "bg-sub-alt text-text")} onClick={() => choose("essential")}>
              reject non-essential
            </button>
            <button type="button" className={cn(buttonClass, "bg-sub-alt text-text")} onClick={() => choose("essential")}>
              more options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
