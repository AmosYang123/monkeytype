"use client";

import type { ReactNode } from "react";
import { Fa } from "@/components/icons";
import { cn } from "@/lib/cn";
import { abbreviateNumber, formatDate, formatDuration, formatTime, type Badge, type SpeedEntry, type XpEntry } from "./data";

const TABLE = cn(
  "w-full table-auto border-separate border-spacing-0",
  "[&>tbody>tr>td]:py-3 [&>tbody>tr>td]:whitespace-nowrap [&>thead>tr>th]:py-2 [&>thead>tr>th]:align-middle",
  "[&>tbody>tr>td]:px-2 [&>tbody>tr>td]:text-[0.75em] [&>thead>tr>th]:px-2 [&>thead>tr>th]:text-[0.75em]",
  "xs:[&>tbody>tr>td]:px-2 xs:[&>tbody>tr>td]:text-[0.8em] xs:[&>thead>tr>th]:px-2 xs:[&>thead>tr>th]:text-[0.8em]",
  "sm:[&>tbody>tr>td]:px-4 sm:[&>tbody>tr>td]:text-[1em] sm:[&>thead>tr>th]:px-4 sm:[&>thead>tr>th]:text-[1em]",
  "xl:[&>tbody>tr>td]:px-6 xl:[&>thead>tr>th]:px-6",
  "[&>tbody>tr:nth-child(odd)>td]:bg-sub-alt [&>tbody>tr>td:first-child]:rounded-l [&>tbody>tr>td:last-child]:rounded-r",
);

const WIDE = "hidden xl:table-cell";
const NARROW = "xl:hidden";

function BadgePill({ badge }: { badge: Badge }) {
  const mythical = badge === "mythical";
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center gap-1 rounded px-2 py-0.5 align-middle text-xs font-bold leading-none",
        mythical ? "bg-[hsl(215,75%,55%)] text-white" : "bg-main text-bg",
      )}
    >
      <Fa icon={mythical ? "rocket" : "fire"} fw={false} />
      {mythical ? "Mythical" : "All Year Long"}
    </span>
  );
}

function Rank({ rank }: { rank: number }) {
  return <td className="text-center">{rank === 1 ? <Fa icon="crown" /> : rank}</td>;
}

function Name({ name, badge }: { name: string; badge?: Badge }) {
  return (
    <td className="w-full text-left">
      <span className="inline-flex items-center gap-2">
        <Fa icon="user-circle" variant="solid" fw={false} className="text-[1.25em] text-sub" />
        {name}
        {badge && <BadgePill badge={badge} />}
      </span>
    </td>
  );
}

function Pair({ a, b, wideClass = WIDE, narrowClass = NARROW }: { a: string; b: string; wideClass?: string; narrowClass?: string }) {
  return (
    <>
      <td className={cn("text-right", wideClass)}>{a}</td>
      <td className={cn("text-right", wideClass)}>{b}</td>
      <td className={cn("text-right", narrowClass)}>
        <div>{a}</div>
        <div className="text-sub">{b}</div>
      </td>
    </>
  );
}

function PairHead({ a, b, narrowClass = NARROW }: { a: string; b: string; narrowClass?: string }) {
  return (
    <>
      <th className={cn("text-right", WIDE)}>{a}</th>
      <th className={cn("text-right", WIDE)}>{b}</th>
      <th className={cn("text-right", narrowClass)}>
        <div>{a}</div>
        <div className="opacity-50 sm:text-base">{b}</div>
      </th>
    </>
  );
}

const MERGED_RAW = "hidden xs:table-cell xl:hidden";

function Head({ children }: { children: ReactNode }) {
  return (
    <thead className="text-sub">
      <tr className="[&>th]:font-normal [&>th]:leading-[1.3333]">{children}</tr>
    </thead>
  );
}

function RankHead() {
  return (
    <th className="text-center">
      <Fa icon="hashtag" />
    </th>
  );
}

export function SpeedTable({ entries }: { entries: SpeedEntry[] }) {
  return (
    <table className={TABLE}>
      <Head>
        <RankHead />
        <th className="text-left">name</th>
        <PairHead a="wpm" b="accuracy" />
        <PairHead a="raw" b="consistency" narrowClass={MERGED_RAW} />
        <th className="text-right">date</th>
      </Head>
      <tbody className="text-base">
        {entries.map((e) => (
          <tr key={e.rank} className="h-16">
            <Rank rank={e.rank} />
            <Name name={e.name} badge={e.badge} />
            <Pair a={e.wpm.toFixed(2)} b={`${e.acc.toFixed(2)}%`} />
            <Pair a={e.raw.toFixed(2)} b={`${e.consistency.toFixed(2)}%`} narrowClass={MERGED_RAW} />
            <td className="text-right">
              <div className="text-sm">
                <div>{formatDate(e.timestamp)}</div>
                <div className="text-sub">{formatTime(e.timestamp)}</div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function XpTable({ entries }: { entries: XpEntry[] }) {
  return (
    <table className={TABLE}>
      <Head>
        <RankHead />
        <th className="text-left">name</th>
        <PairHead a="xp gained" b="time typed" />
        <th className="text-right">date</th>
      </Head>
      <tbody className="text-base">
        {entries.map((e) => (
          <tr key={e.rank}>
            <Rank rank={e.rank} />
            <Name name={e.name} badge={e.badge} />
            <Pair a={abbreviateNumber(e.totalXp)} b={formatDuration(e.timeTypedSeconds)} />
            <td
              className="text-right"
              aria-label={`${formatDate(e.lastActivityTimestamp)} ${formatTime(e.lastActivityTimestamp)}`}
              data-balloon-pos="left"
            >
              <div>{formatDate(e.lastActivityTimestamp)}</div>
              <div className="text-sub">{formatTime(e.lastActivityTimestamp)}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
