"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { H2, H3 } from "@/components/about/Headers";
import { WpmHistoryChart } from "@/components/account/WpmHistoryChart";
import { describeResult, formatDuration, personalBests, PB_SLOTS, resultsCsv, totals } from "@/lib/account-stats";
import { downloadFile } from "@/lib/download";
import { getResults, type SavedResult } from "@/lib/results-history";

const RECENT = 50;
const fmt = (n: number | undefined, digits = 0) => (n === undefined ? "-" : n.toFixed(digits));
const date = (ts: number) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--roundness) bg-sub-alt p-4">
      <div className="text-sub">{label}</div>
      <div className="text-[2em] leading-[1.2] text-text">{value}</div>
    </div>
  );
}

function PbTable({ results }: { results: readonly SavedResult[] }) {
  const pbs = personalBests(results);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PB_SLOTS.map(({ mode, mode2 }) => (
        <div key={mode} className="grid grid-cols-4 gap-2 rounded-(--roundness) bg-sub-alt p-4 text-center">
          {mode2.map((m2) => {
            const pb = pbs[`${mode} ${m2}`];
            return (
              <div key={m2} aria-label={pb ? `${fmt(pb.wpm, 2)} wpm, ${fmt(pb.acc, 2)}% acc, ${date(pb.timestamp)}` : "no result"} data-balloon-pos="up">
                <div className="text-xs text-sub">{mode === "time" ? `${m2} seconds` : `${m2} words`}</div>
                <div className="text-[2em] leading-[1.2] text-text">{pb ? Math.round(pb.wpm) : "-"}</div>
                <div className="text-sub">{pb ? `${Math.floor(pb.acc)}%` : "-"}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function AccountPage() {
  // localStorage is client-only: null until read after mount
  const [results, setResults] = useState<SavedResult[] | null>(null);
  useEffect(() => {
    queueMicrotask(() => setResults(getResults()));
  }, []);

  if (results === null) return <main className="full-width content-grid" aria-busy="true" />;

  if (!results.length) {
    return (
      <main className="full-width content-grid">
        <div className="grid justify-items-center gap-4 py-16 text-center text-sub">
          <H2 text="no tests yet" icon="chart-line" />
          <p>Finished tests are saved in this browser and show up here.</p>
          <Link href="/" className="mt-button px-8 py-4 text-text">take a test</Link>
        </div>
      </main>
    );
  }

  const t = totals(results);
  const recent = results.slice(-RECENT).reverse();

  return (
    <main className="full-width content-grid">
      <div className="grid gap-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="tests completed" value={String(t.tests)} />
          <Tile label="time typing" value={formatDuration(t.seconds)} />
          <Tile label="highest wpm" value={String(Math.round(t.best))} />
          <Tile label="last 10 average" value={`${Math.round(t.last10Wpm)} wpm`} />
        </section>

        <section>
          <H3 text="personal bests" icon="crown" />
          <PbTable results={results} />
        </section>

        <section>
          <H3 text="history" icon="chart-line" />
          <div className="h-75">
            <WpmHistoryChart results={results} />
          </div>
          <div className="mt-2 text-xs text-sub">average {Math.round(t.avgWpm)} wpm · {Math.round(t.avgAcc)}% acc over {t.tests} tests · the newest 200 results are kept</div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <H3 text={`last ${recent.length} results`} icon="history" />
            <div className="flex gap-2">
              <button type="button" className="mt-button px-4 py-2" onClick={() => downloadFile("monkeytype-results.csv", resultsCsv(results), "text/csv")}>export csv</button>
              <button type="button" className="mt-button px-4 py-2" onClick={() => downloadFile("monkeytype-results.json", JSON.stringify(results, null, 2), "application/json")}>export json</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead className="text-xs text-sub">
                <tr>
                  {["wpm", "raw", "acc", "consistency", "test", "date"].map((h) => <th key={h} scope="col" className="px-2 py-1 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={`${r.timestamp}-${i}`} className="odd:bg-sub-alt">
                    <td className="rounded-l-(--roundness) px-2 py-1 text-text">{fmt(r.wpm, 2)}</td>
                    <td className="px-2 py-1">{fmt(r.raw, 2)}</td>
                    <td className="px-2 py-1">{fmt(r.acc, 2)}%</td>
                    <td className="px-2 py-1">{r.consistency === undefined ? "-" : `${fmt(r.consistency, 2)}%`}</td>
                    <td className="px-2 py-1 text-sub">{describeResult(r)}</td>
                    <td className="rounded-r-(--roundness) px-2 py-1 whitespace-nowrap text-sub">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-center text-xs text-sub">
          Results live in this browser only. Accounts are not available in this local clone - <Link href="/login">login page</Link>.
        </p>
      </div>
    </main>
  );
}
