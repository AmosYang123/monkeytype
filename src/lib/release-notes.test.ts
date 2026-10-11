import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInline, parseReleaseBody } from "./release-notes.ts";

test("parses bold and http links, leaves unsafe links as text", () => {
  assert.deepEqual(parseInline("a **b** [c](https://x.y) [d](javascript:alert(1))"), [
    { kind: "text", text: "a " },
    { kind: "bold", text: "b" },
    { kind: "text", text: " " },
    { kind: "link", text: "c", href: "https://x.y" },
    { kind: "text", text: " " },
    { kind: "text", text: "[d](javascript:alert(1)" },
    { kind: "text", text: ")" },
  ]);
});

test("splits headings from lines", () => {
  const blocks = parseReleaseBody("### Fixes\r\n\r\n- one\r\n");
  assert.equal(blocks[0].kind, "heading");
  assert.deepEqual(blocks[1], { kind: "line", inline: [{ kind: "text", text: "- one" }] });
});
