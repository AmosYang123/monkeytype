"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex h-min cursor-pointer appearance-none items-center justify-center gap-[0.5em] rounded-lg border-0 p-2 text-center leading-[1.25] transition-[color,background,opacity] duration-125 ease-[cubic-bezier(0.4,0,0.2,1)] select-none hover:bg-text hover:text-bg active:bg-main active:text-bg focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),0_0_0_0.2rem_var(--text-color)] focus-visible:outline-none";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  /** highlighted (main color) variant */
  active?: boolean;
};

/** monkeytype's filled `Button` (variant "button"); an anchor when `href` is given. */
export function ModalButton({ children, className, href, onClick, active }: Props) {
  const base = cn(BASE, active ? "bg-main text-bg" : "bg-sub-alt text-text", className);
  if (href !== undefined) {
    const external = href.startsWith("http");
    return (
      <a
        className={base}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={base} onClick={onClick}>
      {children}
    </button>
  );
}
