// Cookie consent persisted in localStorage under "cookieConsent" as JSON { security, analytics, sentry }
// (same categories as monkeytype; security is always on).
// Older builds stored the plain strings "all" / "essential"; those are still read.
export type CookieConsent = { security: true; analytics: boolean; sentry: boolean };

export const COOKIE_CONSENT_KEY = "cookieConsent";

export function parseCookieConsent(raw: string | null): CookieConsent | null {
  if (raw === null) return null;
  if (raw === "all") return { security: true, analytics: true, sentry: true };
  if (raw === "essential") return { security: true, analytics: false, sentry: false };
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v === "object" && v !== null) {
      const o = v as Record<string, unknown>;
      return { security: true, analytics: o.analytics === true, sentry: o.sentry === true };
    }
  } catch {
    // fall through: unreadable value counts as "not answered"
  }
  return null;
}

export function readCookieConsent(): CookieConsent | null {
  try {
    return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // storage blocked: choice just won't persist
  }
}
