import { test } from "node:test";
import assert from "node:assert/strict";
import { getOpenModal, showModal, hideModal } from "./modals.ts";

test("chained modals close in order and stale close does nothing", () => {
  showModal("Commandline");
  showModal("CustomText");
  hideModal("Commandline");
  assert.equal(getOpenModal(), "CustomText");
  hideModal("CustomText");
  assert.equal(getOpenModal(), "Commandline");
  hideModal("Commandline");
  assert.equal(getOpenModal(), null);
});

test("opening a stacked modal returns to it without creating a cycle", () => {
  showModal("Commandline");
  showModal("CustomText");
  showModal("Commandline");
  hideModal("Commandline");
  assert.equal(getOpenModal(), null);
});
