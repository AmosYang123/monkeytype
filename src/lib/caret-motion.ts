// Caret / line-scroll timing (values from monkeytype elements/caret.ts and test-ui.ts lineJump).
import type { SmoothCaret } from "./config/types.ts";

const CARET_MS: Record<SmoothCaret, number> = { off: 0, slow: 150, medium: 100, fast: 85 };

/** ms the caret takes to glide to its next position */
export const caretDuration = (smooth: SmoothCaret): number => CARET_MS[smooth] ?? 0;
/** approximates animejs "inOut(1.25)" */
export const CARET_EASING = "cubic-bezier(0.45, 0, 0.55, 1)";
/** smoothLineScroll: #words marginTop animation */
export const LINE_SCROLL_MS = 125;
/** approximates animejs "out(2)" */
export const LINE_SCROLL_EASING = "cubic-bezier(0.5, 1, 0.89, 1)";
