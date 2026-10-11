// Cookie consent persisted in localStorage under "cookieConsent" as JSON { analytics, sponsorship }.
// Older builds stored the plain strings "all" / "essential"; those are still read.
export type CookieConsent = { analytics: boolean; sponsorship: boolean };

export const COOKIE_CONSENT_KEY = "cookieConsent";

export function parseCookieConsent(raw: string | null): CookieConsent | null {
  if (raw === null) return null;
  if (raw === "all") return { analytics: true, sponsorship: true };
  if (raw === "essential") return { analytics: false, sponsorship: false };
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v === "object" && v !== null) {
      const o = v as Record<string, unknown>;
      return { analytics: o.analytics === true, sponsorship: o.sponsorship === true };
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
