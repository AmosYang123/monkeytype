"use client";

import { useEffect, useState } from "react";
import { useConfig } from "@/components/ConfigProvider";
import { useTest } from "@/components/TestProvider";
import { parseLayout } from "@/lib/engine-options";
import { cn } from "@/lib/cn";

export function Keymap() {
  const config = useConfig();
  const { state } = useTest();
  const [rows, setRows] = useState<string[][][]>([]);
  const [error, setError] = useState(false);
  const [pressed, setPressed] = useState("");
  const [shift, setShift] = useState(false);
  const layout = config.keymapLayout === "overrideSync" ? config.layout === "default" ? "qwerty" : config.layout : config.keymapLayout;
  useEffect(() => {
    if (config.keymapMode === "off") return;
    let active = true;
    fetch(`/layouts/${layout}.json`).then(async (response) => {
      if (!response.ok) throw new Error("Layout unavailable");
      return parseLayout(await response.json());
    }).then((value) => { if (active) { setRows(value); setError(false); } }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [layout, config.keymapMode]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => { setPressed(event.key); setShift(event.shiftKey); };
    const up = () => { setPressed(""); setShift(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  if (config.keymapMode === "off") return null;
  if (error) return <div className="text-center text-xs text-error">Keyboard layout unavailable: {layout}</div>;
  const next = state.words[state.inputs.length - 1]?.[state.inputs.at(-1)?.length ?? 0] ?? " ";
  const visible = config.keymapKeys === "minimal" ? rows.slice(1) : rows;
  return <div aria-label={`${layout} keyboard`} className="full-width mx-auto my-4 grid w-max max-w-full gap-1 text-sub" style={{ fontSize: `${config.keymapSize}rem` }}>
    {visible.map((row, i) => <div key={i} className="flex justify-center gap-1" style={{ paddingLeft: config.keymapStyle === "staggered" ? `${i * 0.3}em` : undefined }}>
      {row.map((key, j) => {
        const highlighted = config.keymapMode === "react" ? key.includes(pressed) : config.keymapMode === "next" && key.includes(next);
        const label = config.keymapLegendStyle === "blank" ? "" : config.keymapLegendStyle === "uppercase" ? key[0].toUpperCase() : config.keymapLegendStyle === "dynamic" && shift ? key[1] ?? key[0] : key[0];
        return <span key={j} className={cn("grid h-[1.8em] min-w-[1.8em] place-items-center rounded border border-sub px-1", highlighted && "border-main bg-main text-bg")} style={{ width: key[0] === " " ? "8em" : undefined }} aria-label={key[0] === " " ? "space" : key[0]}>{label}</span>;
      })}
    </div>)}
  </div>;
}
