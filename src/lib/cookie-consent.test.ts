import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCookieConsent } from "./cookie-consent.ts";

test("reads legacy string values", () => {
  assert.deepEqual(parseCookieConsent("all"), { analytics: true, sponsorship: true });
  assert.deepEqual(parseCookieConsent("essential"), { analytics: false, sponsorship: false });
});

test("reads JSON and rejects junk", () => {
  assert.deepEqual(parseCookieConsent('{"analytics":true,"sponsorship":false}'), { analytics: true, sponsorship: false });
  assert.equal(parseCookieConsent(null), null);
  assert.equal(parseCookieConsent("nope"), null);
  assert.equal(parseCookieConsent("5"), null);
});
