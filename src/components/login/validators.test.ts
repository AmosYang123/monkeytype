import { test } from "node:test";
import assert from "node:assert/strict";
import { emailWarnings, validateEmail, validateNewPassword, validateUsername } from "./validators.ts";

test("username rules", () => {
  assert.deepEqual(validateUsername("miodec_01"), []);
  assert.ok(validateUsername("").length > 0);
  assert.ok(validateUsername("a".repeat(17)).length > 0);
  assert.ok(validateUsername(".dot").includes("Cannot start with a dot"));
  assert.ok(validateUsername("sp ace").length > 0);
});

test("email rules and warnings", () => {
  assert.deepEqual(validateEmail("me@example.com"), []);
  assert.deepEqual(validateEmail("me@@example"), ["Invalid email"]);
  assert.equal(emailWarnings("me@gamil.com").length, 1);
  assert.equal(emailWarnings("me@example.com").length, 0);
});

test("new password rules", () => {
  assert.deepEqual(validateNewPassword("Str0ng!pass"), []);
  const weak = validateNewPassword("weak");
  assert.ok(weak.includes("must be at least 8 characters"));
  assert.ok(weak.includes("must contain at least one capital letter"));
  assert.ok(weak.includes("must contain at least one number"));
  assert.ok(weak.includes("must contain at least one special character"));
});
