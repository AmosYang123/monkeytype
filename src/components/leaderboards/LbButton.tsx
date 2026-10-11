import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// monkeytype's filled "Button": sub-alt bg, active = main, hover = text
export function LbButton({
  onClick,
  active,
  disabled,
  className,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-min cursor-pointer appearance-none items-center justify-center gap-2 rounded px-3 py-2 text-base leading-5 transition-[color,background,opacity] duration-[125ms] ease-[cubic-bezier(.4,0,.2,1)] hover:bg-text hover:text-bg disabled:pointer-events-none disabled:opacity-[.33]",
        active ? "bg-main text-bg" : "bg-sub-alt text-text",
        className,
      )}
    >
      {children}
    </button>
  );
}
