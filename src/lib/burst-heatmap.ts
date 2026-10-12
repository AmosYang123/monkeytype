// Burst heatmap for the result words history (port of monkeytype's ResultWordsHistory buildHeatmap).
// Pure: callers pass the bursts and theme colors (read from CSS variables at runtime).

export type HeatmapTheme = { main: string; sub: string; subAlt: string; text: string; colorfulError: string };

export type Heatmap = { steps: number[]; colors: string[]; unreachedColor: string; legend: string[] };

function hexToRgb(hex: string): number[] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

/** monkeytype's blendTwoHexColors: per channel round(c1 * (1 - o) + c2 * o). */
export function blendHex(c1: string, c2: string, opacity: number): string {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  if ([...a, ...b].some(Number.isNaN)) return "#000000";
  return "#" + a.map((v, i) => Math.round(v * (1 - opacity) + b[i] * opacity).toString(16).padStart(2, "0")).join("");
}

/** Instant words: non-finite or >= 1000 (upstream's Infinity). They are left out of the steps. */
const isInstant = (burst: number) => !Number.isFinite(burst) || burst >= 1000;

/** Step thresholds: 0 and the 15/35/65/85th percentile of the rounded, sorted finite bursts; [] when there are none. */
export function heatmapSteps(bursts: number[]): number[] {
  const sorted = bursts.filter((b) => !isInstant(b)).map((b) => Math.round(b)).sort((a, b) => a - b);
  const len = sorted.length;
  if (len === 0) return [];
  return [0, ...[0.15, 0.35, 0.65, 0.85].map((p) => sorted[(len * p) | 0])];
}

/** Legend labels: `<s1`, `s1-(s2-1)`, ..., `s4+`; equal neighbouring steps give `v-v`. */
export function heatmapLegend(steps: number[]): string[] {
  return steps.map((val, i) => {
    const next = steps[i + 1];
    if (i === 0) return `<${Math.round(next)}`;
    if (i === steps.length - 1) return `${Math.round(val)}+`;
    if (val !== next) return `${Math.round(val)}-${Math.round(next) - 1}`;
    return `${Math.round(val)}-${Math.round(val)}`;
  });
}

export function heatmapColors(theme: HeatmapTheme): { colors: string[]; unreachedColor: string } {
  const { main, sub, subAlt, text, colorfulError } = theme;
  if (main === text) {
    return {
      colors: [colorfulError, blendHex(colorfulError, text, 0.5), sub, blendHex(sub, text, 0.5), main],
      unreachedColor: subAlt,
    };
  }
  return {
    colors: [colorfulError, blendHex(colorfulError, text, 0.5), text, blendHex(main, text, 0.5), main],
    unreachedColor: sub,
  };
}

export function buildHeatmap(bursts: number[], theme: HeatmapTheme): Heatmap {
  const steps = heatmapSteps(bursts);
  return { steps, ...heatmapColors(theme), legend: heatmapLegend(steps) };
}

/** Word color: unreached (untyped) words get unreachedColor, instant words get the top (main) color; no steps means no colors. */
export function heatmapWordColor(burst: number | undefined, heatmap: Heatmap): string | undefined {
  if (burst === undefined) return heatmap.unreachedColor;
  if (heatmap.steps.length === 0) return undefined;
  if (isInstant(burst)) return heatmap.colors[heatmap.colors.length - 1];
  const value = Math.round(Math.trunc(burst));
  let color: string | undefined;
  heatmap.steps.forEach((step, i) => {
    if (value >= step) color = heatmap.colors[i];
  });
  return color;
}
