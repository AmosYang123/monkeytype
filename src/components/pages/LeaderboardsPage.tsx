"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/leaderboards/Navigation";
import { NextUpdate } from "@/components/leaderboards/NextUpdate";
import { Sidebar } from "@/components/leaderboards/Sidebar";
import { SpeedTable, XpTable } from "@/components/leaderboards/Table";
import { Title } from "@/components/leaderboards/Title";
import {
  PAGE_SIZE,
  normalizeSelection,
  pageFromParams,
  paramsFor,
  selectionFromParams,
  speedEntries,
  xpEntries,
  type Selection,
} from "@/components/leaderboards/data";

function Leaderboards() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [previous, setPrevious] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Match the prerendered clock before switching to local time after hydration.
    queueMicrotask(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === 0) return null;

  const selection: Selection = { ...selectionFromParams(params), previous };
  const requested = pageFromParams(params);
  const xp = selection.type === "weekly" ? xpEntries(selection, now) : null;
  const speed = xp ? null : speedEntries(selection, now);
  const lastPage = Math.ceil((xp ?? speed ?? []).length / PAGE_SIZE);
  const page = Math.min(requested, lastPage - 1);
  const range = [page * PAGE_SIZE, (page + 1) * PAGE_SIZE] as const;

  const go = (sel: Selection, p: number) => router.replace(`${pathname}?${paramsFor(sel, p)}`);
  const onSelect = (patch: Partial<Selection>) => {
    const next = normalizeSelection({ ...selection, ...patch });
    setPrevious(false);
    go(next, 0);
  };
  const navigation = (className: string, onChange: (p: number) => void) => (
    <Navigation lastPage={lastPage} currentPage={page} onPageChange={onChange} className={className} />
  );

  return (
    <div className="flex min-w-0 flex-col gap-8 lg:-mx-4 lg:flex-row">
      <div className="w-full shrink-0 lg:w-60 2xl:w-75">
        <Sidebar selection={selection} onSelect={onSelect} />
      </div>
      <div className="flex min-w-0 w-full flex-1 flex-col gap-8">
        <Title selection={selection} now={now} onTogglePrevious={() => setPrevious((p) => !p)} />
        <div className="h-1 w-full rounded bg-sub-alt" />
        <div>
          <div className="mb-2 grid grid-cols-1 items-center justify-between gap-2 text-sm sm:grid-cols-2 sm:text-base">
            <NextUpdate type={selection.type} now={now} />
            {navigation("w-full sm:w-max", (p) => go(selection, p))}
          </div>
          <div className="overflow-x-auto">
            {xp ? <XpTable entries={xp.slice(...range)} /> : <SpeedTable entries={(speed ?? []).slice(...range)} />}
          </div>
          <div className="mt-4 grid grid-cols-1 items-center justify-between text-sm sm:text-base">
            {navigation("w-full sm:w-max", (p) => {
              go(selection, p);
              window.scrollTo({ top: 0 });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardsPage() {
  return (
    <main className="full-width content-grid">
      <Suspense fallback={null}>
        <Leaderboards />
      </Suspense>
    </main>
  );
}
