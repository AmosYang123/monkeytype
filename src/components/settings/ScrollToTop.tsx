"use client";

import { useEffect, useState } from "react";
import { Fa } from "@/components/icons";

/** Floating #scrollToTop button, shown once the page is scrolled down. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 100);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      id="scrollToTop"
      aria-label="scroll to top"
      className="fixed right-8 bottom-8 z-[99] grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-sub-alt text-2xl text-sub hover:bg-text hover:text-bg"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Fa icon="angle-double-up" />
    </button>
  );
}
