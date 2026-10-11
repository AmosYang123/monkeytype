"use client";

import { nextUpdateText, type LbType } from "./data";

export function NextUpdate({ type, now }: { type: LbType; now: number }) {
  return <div className="text-sub">{nextUpdateText(type, now)}</div>;
}
