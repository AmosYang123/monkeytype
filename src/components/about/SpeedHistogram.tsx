"use client";

import { useEffect, useRef } from "react";
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

// ponytail: static plausible distribution (no backend); bucket = 10 wpm
const COUNTS = [60, 90, 180, 420, 800, 1300, 1900, 2400, 2500, 2200, 1700, 1250, 880, 600, 400, 260, 160, 100, 62, 38, 22, 14, 8, 5, 3, 2];
const LABELS = COUNTS.map((_, i) => `${i * 10}`);
export const HISTOGRAM_TOTAL = COUNTS.reduce((a, b) => a + b, 0);

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function SpeedHistogram() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const main = cssVar("--main-color");
    const sub = cssVar("--sub-color");
    const subAlt = cssVar("--sub-alt-color");
    const axis = { ticks: { color: sub }, grid: { color: subAlt }, border: { color: subAlt } };
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: LABELS,
        datasets: [{ label: "Users", data: COUNTS, minBarLength: 2, backgroundColor: main, borderColor: main }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { ...axis, offset: true },
          y: {
            ...axis,
            beginAtZero: true,
            min: 0,
            ticks: { color: sub, autoSkip: true, autoSkipPadding: 20 },
            title: { display: true, text: "Users", color: sub },
          },
        },
        plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
      },
    });
    return () => chart.destroy();
  }, []);

  return <canvas ref={ref} />;
}
