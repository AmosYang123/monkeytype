"use client";

import { Fa, type FaIconName } from "@/components/icons";
import { cn } from "@/lib/cn";

type Props = {
  text: string;
  icon?: FaIconName;
  href?: string;
  onClick?: () => void;
  variant?: "text" | "button";
  className?: string;
};

const base =
  "inline-flex h-min cursor-pointer appearance-none items-center justify-center gap-[0.5em] rounded-lg border-0 p-[0.5em] text-center leading-[1.25] transition-[color,background,opacity] duration-[125ms] ease-in-out select-none focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),0_0_0_0.2rem_var(--text-color)] focus-visible:outline-none";
const variants = {
  button: "bg-sub-alt text-text hover:bg-text hover:text-bg active:bg-sub",
  text: "bg-transparent text-sub hover:text-text active:text-sub",
};

export function AboutButton({ text, icon, href, onClick, variant = "button", className }: Props) {
  const cls = cn(base, variants[variant], className);
  const content = (
    <>
      {icon && <Fa icon={icon} />}
      {text}
    </>
  );
  if (href !== undefined) {
    const external = !href.startsWith("#");
    return (
      <a
        className={cls}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {content}
    </button>
  );
}
