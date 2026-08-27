import { test, describe } from "node:test";
import assert from "node:assert";

// Retrieve test target URL from env vars
const targetUrl = process.env.TEST_TARGET_URL || "http://localhost:3000";

console.log(`Running UI integration tests against target: ${targetUrl}`);

describe("Portfolio UI API Integration Tests", () => {
  describe("Public & Health Endpoints", () => {
    test("GET /api/health returns 200 or 503", async () => {
      const res = await fetch(`${targetUrl}/api/health`);
      assert.ok(res.status === 200 || res.status === 503, `Expected 200 or 503, got ${res.status}`);
    });

    test("GET /api/spotify returns 200", async () => {
      const res = await fetch(`${targetUrl}/api/spotify`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.ok("isPlaying" in body);
    });

    test("GET /api/stats/public returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/stats/public`);
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });
  });
});
