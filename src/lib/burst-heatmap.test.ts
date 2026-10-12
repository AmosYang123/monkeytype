import assert from "node:assert/strict";
import { test } from "node:test";
import { blendHex, buildHeatmap, heatmapLegend, heatmapSteps, heatmapWordColor } from "./burst-heatmap.ts";

const carbon = { main: "#f66e0d", sub: "#616161", subAlt: "#2b2b2b", text: "#f5e6c8", colorfulError: "#e72d2d" };

test("carbon colors match monkeytype", () => {
  assert.deepEqual(buildHeatmap([50], carbon).colors, ["#e72d2d", "#ee8a7b", "#f5e6c8", "#f6aa6b", "#f66e0d"]);
  assert.equal(buildHeatmap([50], carbon).unreachedColor, "#616161");
});

test("blendHex rounds per channel and accepts short hex", () => {
  assert.equal(blendHex("#000", "#fff", 0.5), "#808080");
  assert.equal(blendHex("nope", "#fff", 0.5), "#000000");
});

test("main === text swaps in sub colors", () => {
  const h = buildHeatmap([50], { ...carbon, main: "#ffffff", text: "#ffffff" });
  assert.equal(h.colors[2], carbon.sub);
  assert.equal(h.unreachedColor, carbon.subAlt);
});

test("steps are percentiles of rounded sorted bursts, >= 1000 is Infinity", () => {
  const bursts = [100, 10, 90, 20, 80, 30, 70, 40, 60, 50.4];
  assert.deepEqual(heatmapSteps(bursts), [0, 20, 40, 70, 90]);
  assert.deepEqual(heatmapSteps([1000, 5]), [0, 5, 5, 5, 5]);
});

test("steps ignore instant bursts; no finite bursts means no steps", () => {
  assert.deepEqual(heatmapSteps([Infinity, 10, 20, 2000, 30, Number.NaN]), [0, 10, 20, 20, 30]);
  assert.deepEqual(heatmapSteps([Infinity, 2000]), []);
  assert.deepEqual(heatmapSteps([]), []);
});

test("mixed finite and instant bursts give clean labels; instant word gets main color", () => {
  const h = buildHeatmap([10, Infinity, 20, 30, 1500, 40], carbon);
  assert.deepEqual(h.steps, [0, 10, 20, 30, 40]);
  assert.deepEqual(h.legend, ["<10", "10-19", "20-29", "30-39", "40+"]);
  assert.equal(h.legend.some((label) => label.includes("Infinity")), false);
  assert.equal(heatmapWordColor(Infinity, h), carbon.main);
  assert.equal(heatmapWordColor(1500, h), carbon.main);
});

test("all-instant bursts give no steps, no legend and no word colors", () => {
  const h = buildHeatmap([Infinity, 2000], carbon);
  assert.deepEqual(h.steps, []);
  assert.deepEqual(h.legend, []);
  assert.equal(heatmapWordColor(Infinity, h), undefined);
  assert.equal(heatmapWordColor(50, h), undefined);
  assert.equal(heatmapWordColor(undefined, h), carbon.sub);
});

test("legend labels", () => {
  assert.deepEqual(heatmapLegend([0, 20, 40, 70, 90]), ["<20", "20-39", "40-69", "70-89", "90+"]);
  assert.deepEqual(heatmapLegend([0, 50, 50, 50, 60]), ["<50", "50-50", "50-50", "50-59", "60+"]);
});

test("word color picks the last step reached", () => {
  const h = buildHeatmap([10, 20, 30, 40, 50, 60, 70, 80, 90, 100], carbon);
  assert.equal(heatmapWordColor(5, h), "#e72d2d");
  assert.equal(heatmapWordColor(20, h), "#ee8a7b");
  assert.equal(heatmapWordColor(95, h), "#f66e0d");
  assert.equal(heatmapWordColor(undefined, h), "#616161");
  assert.equal(heatmapWordColor(Infinity, h), carbon.main);
});
