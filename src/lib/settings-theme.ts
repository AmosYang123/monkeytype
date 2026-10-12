import type { CustomThemeColors } from "./config/types.ts";

/** Shared URLs are untrusted; accept only the ten theme colors used by config. */
export function parseSharedTheme(
  encoded: string | null,
): CustomThemeColors | null {
  if (!encoded || encoded.length > 2048) return null;
  try {
    const parsed: unknown = JSON.parse(atob(encoded));
    if (!parsed || typeof parsed !== "object") return null;
    const colors = (parsed as { c?: unknown }).c;
    if (
      !Array.isArray(colors) ||
      colors.length !== 10 ||
      !colors.every(
        (color) =>
          typeof color === "string" &&
          /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color),
      )
    )
      return null;
    return colors as CustomThemeColors;
  } catch {
    return null;
  }
}

export function validLocalBackground(value: string | null): string {
  return value &&
    value.length <= 4000100 &&
    /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp);base64,[a-z0-9+/=]+$/i.test(
      value,
    )
    ? value
    : "";
}
