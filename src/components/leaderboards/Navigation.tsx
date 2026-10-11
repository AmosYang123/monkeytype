"use client";

import { useState } from "react";
import { Fa } from "@/components/icons";
import { cn } from "@/lib/cn";
import { LbButton } from "./LbButton";

const BUTTON = "px-3 sm:px-4";

export function Navigation({
  lastPage,
  currentPage,
  onPageChange,
  className,
}: {
  lastPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const n = Number.parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 1) onPageChange(Math.min(n, lastPage) - 1);
    setEditing(false);
  };

  return (
    <div className={cn("grid grid-flow-col items-center gap-2 justify-self-end", className)}>
      <LbButton onClick={() => onPageChange(0)} disabled={currentPage === 0} className={BUTTON}>
        <Fa icon="crown" />
      </LbButton>
      <LbButton onClick={() => onPageChange(Math.max(0, Math.min(currentPage, lastPage) - 1))} disabled={currentPage === 0} className={BUTTON}>
        <Fa icon="chevron-left" />
      </LbButton>
      {editing ? (
        <input
          autoFocus
          type="number"
          min={1}
          max={lastPage}
          value={draft}
          placeholder="Page"
          aria-label="Go to page"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-9 w-24 rounded bg-sub-alt px-3 text-center text-text outline-none"
        />
      ) : (
        <LbButton
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          disabled={lastPage <= 1}
          className={BUTTON}
        >
          <Fa icon="hashtag" /> {currentPage + 1}
        </LbButton>
      )}
      <LbButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage + 1 >= lastPage} className={BUTTON}>
        <Fa icon="chevron-right" />
      </LbButton>
    </div>
  );
}
