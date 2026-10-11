import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCookieConsent } from "./cookie-consent.ts";

test("reads legacy string values", () => {
  assert.deepEqual(parseCookieConsent("all"), { security: true, analytics: true, sentry: true });
  assert.deepEqual(parseCookieConsent("essential"), { security: true, analytics: false, sentry: false });
});

test("reads JSON and rejects junk", () => {
  assert.deepEqual(parseCookieConsent('{"analytics":true,"sentry":false}'), { security: true, analytics: true, sentry: false });
  assert.equal(parseCookieConsent(null), null);
  assert.equal(parseCookieConsent("nope"), null);
  assert.equal(parseCookieConsent("5"), null);
});
