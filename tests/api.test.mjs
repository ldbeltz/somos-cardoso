import test from "node:test";
import assert from "node:assert/strict";
import { api, ApiError } from "../lib/api.ts";
const originalFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = originalFetch;
});
test("each mutation fetches a fresh CSRF token and includes session cookies", async () => {
  let counter = 0;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith("csrf"))
      return Response.json({
        token: `token-${++counter}`,
        headerName: "X-CSRF-TOKEN",
      });
    return Response.json({ ok: true });
  };
  await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "x@y.test" }),
  });
  await api("/auth/logout", { method: "POST" });
  assert.equal(calls.length, 4);
  assert.equal(calls[1].init.headers.get("X-CSRF-TOKEN"), "token-1");
  assert.equal(calls[3].init.headers.get("X-CSRF-TOKEN"), "token-2");
  assert.equal(calls[1].init.credentials, "include");
  assert.equal(calls[1].init.cache, "no-store");
});
test("failed CSRF fetch prevents mutation", async () => {
  let count = 0;
  globalThis.fetch = async () => {
    count++;
    return new Response("", { status: 503 });
  };
  await assert.rejects(
    () => api("/secret-santas", { method: "POST" }),
    /secure your request/,
  );
  assert.equal(count, 1);
});
test("reports backend errors with HTTP status", async () => {
  globalThis.fetch = async () =>
    Response.json({ message: "Please sign in" }, { status: 401 });
  await assert.rejects(
    () => api("/auth/me"),
    (e) =>
      e instanceof ApiError &&
      e.status === 401 &&
      e.message === "Please sign in",
  );
});
test("supports empty success responses", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await api("/empty"), undefined);
});
