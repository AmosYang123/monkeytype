"use client";

import { useEffect, useRef } from "react";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
  type ChartConfiguration,
  type ScriptableContext,
} from "chart.js";
import type { ChartData } from "@/types/test";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ScatterController,
  Filler,
  Tooltip,
);

Chart.defaults.animation = false;
Chart.defaults.elements.line.tension = 0.5;
Chart.defaults.elements.line.fill = "origin";
Chart.defaults.font.family = "Roboto Mono";

export type ChartVisibility = { raw: boolean; burst: boolean; errors: boolean };

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function errorRadius(size: number) {
  return <T extends "line" | "scatter">(ctx: ScriptableContext<T>): number => {
    const value: unknown = ctx.raw;
    return typeof value === "number" && value > 0 ? size : 0;
  };
}

function buildConfig(data: ChartData, vis: ChartVisibility): ChartConfiguration<"line" | "scatter", number[], string> {
  const main = cssVar("--main-color");
  const sub = cssVar("--sub-color");
  const subAlt = cssVar("--sub-alt-color");
  const error = cssVar("--error-color");
  const rawColor = `${main}99`;
  // same as monkeytype: max over visible speed series, rounded up to a multiple of 10
  const max = Math.ceil(Math.max(1, ...data.wpm, ...(vis.raw ? data.raw : []), ...(vis.burst ? data.burst : [])) / 10) * 10;
  const axis = {
    ticks: { color: sub, autoSkip: true, autoSkipPadding: 20 },
    title: { color: sub },
    grid: { color: subAlt, tickColor: subAlt },
    border: { color: subAlt },
  };
  const yRange = { beginAtZero: true, min: 0, max };

  return {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "wpm",
          data: data.wpm,
          borderColor: main,
          backgroundColor: "transparent",
          pointBackgroundColor: main,
          pointBorderColor: main,
          borderWidth: 3,
          yAxisID: "wpm",
          order: 2,
          pointRadius: 1,
          clip: false as unknown as number,
        },
        {
          label: "raw",
          data: data.raw,
          hidden: !vis.raw,
          borderColor: rawColor,
          backgroundColor: "transparent",
          pointBackgroundColor: rawColor,
          pointBorderColor: rawColor,
          borderWidth: 2,
          yAxisID: "raw",
          borderDash: [8, 8],
          order: 3,
          pointRadius: 0,
          clip: false as unknown as number,
        },
        {
          type: "scatter",
          label: "errors",
          data: data.err,
          hidden: !vis.errors,
          borderColor: error,
          backgroundColor: error,
          borderWidth: 2,
          order: 1,
          yAxisID: "error",
          pointStyle: "crossRot",
          pointRadius: errorRadius(3),
          pointHoverRadius: errorRadius(5),
          clip: false as unknown as number,
        },
        {
          label: "burst",
          data: data.burst,
          hidden: !vis.burst,
          borderColor: sub,
          backgroundColor: `${subAlt}80`,
          pointBackgroundColor: sub,
          pointBorderColor: sub,
          borderWidth: 3,
          yAxisID: "burst",
          order: 4,
          pointRadius: 1,
          clip: false as unknown as number,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ...axis, display: true, title: { ...axis.title, display: false, text: "Seconds" } },
        wpm: {
          ...axis,
          ...yRange,
          display: true,
          title: { ...axis.title, display: true, text: "Words per Minute" },
          grid: { ...axis.grid, display: true },
        },
        raw: { ...axis, ...yRange, display: false },
        burst: { ...axis, ...yRange, display: false },
        error: {
          ...axis,
          display: true,
          position: "right",
          title: { ...axis.title, display: true, text: "Errors" },
          beginAtZero: true,
          max: Math.max(1, ...data.err),
          ticks: { ...axis.ticks, precision: 0 },
          grid: { ...axis.grid, display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false, animation: { duration: 250 } },
      },
    },
  };
}

export function ResultChart({ data, visibility }: { data: ChartData; visibility: ChartVisibility }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // chart is rebuilt when data or visibility changes (animation is off, so it is indistinguishable from an update)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const chart = new Chart(canvas, buildConfig(data, visibility));
    return () => chart.destroy();
  }, [data, visibility]);

  return <canvas ref={canvasRef} />;
}
