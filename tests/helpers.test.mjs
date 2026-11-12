import test from "node:test";
import assert from "node:assert/strict";
import { createPayload, initials } from "../lib/helpers.ts";
test("draw creation includes creator once and converts local time to an instant", () => {
  const result = createPayload(
    " Christmas ",
    "2030-12-20T19:30",
    [2, 1, 2],
    1,
    0,
  );
  assert.equal(result.name, "Christmas");
  assert.deepEqual(result.playerIds, [1, 2]);
  assert.equal(result.drawAt, new Date("2030-12-20T19:30").toISOString());
});
test("requires a different second player", () =>
  assert.throws(
    () => createPayload("Christmas", "2030-12-20T19:30", [1, 1], 1, 0),
    /one other player/,
  ));
test("rejects past and invalid dates", () => {
  assert.throws(() => createPayload("Christmas", "bad", [2], 1, 0), /future/);
  assert.throws(
    () => createPayload("Christmas", "2020-12-20T19:30", [2], 1, Date.now()),
    /future/,
  );
});
test("rejects empty names", () =>
  assert.throws(
    () => createPayload("   ", "2030-12-20T19:30", [2], 1, 0),
    /name/,
  ));
test("avatar initials handle extra spaces", () =>
  assert.equal(initials("  Maria   Cardoso  "), "MC"));
