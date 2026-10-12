// Test modes notice row (ported from monkeytype TestModesNotice.tsx, GPL-3.0).
// Config-derived notices plus "repeated" and local pb/daily stats; challenge/tags/zen need state the clone lacks.
// ponytail: speeds always print as wpm (the clone ignores typingSpeedUnit elsewhere too).
import type { Config } from "./config/types.ts";
import type { FaIconName } from "../components/icons.tsx";

export type TestNotice = {
  icon: FaIconName;
  text: string;
  /** commandline subgroup (= settings id) opened on click; none = not clickable */
  subgroup?: string;
  error?: boolean;
};

const spaced = (text: string) => text.replaceAll("_", " ");

/** `paceAverageWpm` is the saved-results average; missing/NaN shows as "average pace 0 wpm" (upstream behaviour). */
/** `stats` carries the local personal best and today's average for the current config (0 = none). */
export function testNotices(config: Config, paceAverageWpm = 0, isRepeated = false, stats: { pb?: number; daily?: number } = {}): TestNotice[] {
  const pb = Math.round(stats.pb ?? 0) || 0;
  const notices: (TestNotice | false)[] = [
    isRepeated && config.mode !== "quote" && { icon: "sync-alt", text: "repeated", error: true },
    !config.resultSaving && { icon: "save", text: "saving disabled", subgroup: "resultSaving", error: true },
    config.mode !== "zen" && !config.funbox.includes("polyglot") && { icon: "globe-americas", text: spaced(config.language), subgroup: "language" },
    (config.difficulty === "expert" || config.difficulty === "master") && { icon: config.difficulty === "expert" ? "star-half-alt" : "star", text: config.difficulty, subgroup: "difficulty" },
    config.blindMode && { icon: "eye-slash", text: "blind", subgroup: "blindMode" },
    config.lazyMode && { icon: "couch", text: "lazy", subgroup: "lazyMode" },
    config.paceCaret === "average" && { icon: "tachometer-alt", text: `average pace ${Math.round(paceAverageWpm) || 0} wpm`, subgroup: "paceCaret" },
    config.paceCaret === "pb" && { icon: "tachometer-alt", text: `pb pace ${pb} wpm`, subgroup: "paceCaret" },
    config.paceCaret === "daily" && { icon: "tachometer-alt", text: `daily pace ${Math.round(stats.daily ?? 0) || 0} wpm`, subgroup: "paceCaret" },
    config.showPb && { icon: "crown", text: pb ? `${pb} wpm` : "no pb", subgroup: "showPb" },
    config.paceCaret === "custom" && { icon: "tachometer-alt", text: `custom pace ${config.paceCaretCustomSpeed} wpm`, subgroup: "paceCaret" },
    config.minWpm !== "off" && { icon: "bomb", text: `min ${config.minWpmCustomSpeed} wpm`, subgroup: "minWpm" },
    config.minAcc !== "off" && { icon: "bomb", text: `min ${config.minAccCustom}% acc`, subgroup: "minAcc" },
    config.minBurst !== "off" && { icon: "bomb", text: `min ${config.minBurstCustomSpeed} wpm burst${config.minBurst === "flex" ? " (flex)" : ""}`, subgroup: "minBurst" },
    config.funbox.length > 0 && { icon: "gamepad", text: config.funbox.map(spaced).join(", "), subgroup: "funbox" },
    config.confidenceMode !== "off" && { icon: "backspace", text: config.confidenceMode === "max" ? "max confidence" : "confidence", subgroup: "confidenceMode" },
    config.stopOnError !== "off" && { icon: "hand-paper", text: `stop on ${config.stopOnError}`, subgroup: "stopOnError" },
    config.deleteOnError !== "off" && { icon: "eraser", text: `delete on ${spaced(config.deleteOnError)}`, subgroup: "deleteOnError" },
    config.layout !== "default" && { icon: "keyboard", text: `emulating ${spaced(config.layout)}`, subgroup: "layout" },
    config.oppositeShiftMode !== "off" && { icon: "exchange-alt", text: `opposite shift${config.oppositeShiftMode === "keymap" ? " (keymap)" : ""}`, subgroup: "oppositeShiftMode" },
  ];
  return notices.filter((notice) => notice !== false);
}
