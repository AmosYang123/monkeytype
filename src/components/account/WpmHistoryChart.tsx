"use client";

import { useEffect, useRef } from "react";
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";
import { rollingAverage, describeResult } from "@/lib/account-stats";
import type { SavedResult } from "@/lib/results-history";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** wpm per saved result (oldest left) with a 10-result rolling average */
export function WpmHistoryChart({ results }: { results: readonly SavedResult[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const main = cssVar("--main-color");
    const sub = cssVar("--sub-color");
    const subAlt = cssVar("--sub-alt-color");
    const wpm = results.map((r) => Math.round(r.wpm * 100) / 100);
    const axis = { ticks: { color: sub, autoSkip: true, autoSkipPadding: 20 }, grid: { color: subAlt }, border: { color: subAlt } };
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels: results.map((_, i) => String(i + 1)),
        datasets: [
          { label: "wpm", data: wpm, borderColor: sub, backgroundColor: sub, borderWidth: 0, pointRadius: 2, showLine: false, fill: false },
          { label: "avg10", data: rollingAverage(wpm).map((v) => Math.round(v * 100) / 100), borderColor: main, backgroundColor: main, borderWidth: 2, pointRadius: 0, tension: 0.3, fill: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
          x: { ...axis, title: { display: true, text: "test", color: sub } },
          y: { ...axis, beginAtZero: true, title: { display: true, text: "words per minute", color: sub } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const r = results[items[0]?.dataIndex ?? -1];
                return r ? `${describeResult(r)}\n${new Date(r.timestamp).toLocaleString()}` : "";
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [results]);

  return <canvas ref={ref} aria-label="words per minute over time" role="img" />;
}
