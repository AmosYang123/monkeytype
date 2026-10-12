"use client";

import { Fa } from "@/components/icons";
import { openCommandline } from "@/lib/commandline-bridge";

export function CommandLineFab() {
  return (
    <button
      type="button"
      aria-label="command line"
      onClick={() => openCommandline()}
      className="fixed bottom-8 left-8 z-[99] hidden h-12 w-12 place-items-center rounded-full bg-main text-bg [@media(hover:none)_and_(pointer:coarse)]:grid"
    >
      <Fa icon="terminal" />
    </button>
  );
}
