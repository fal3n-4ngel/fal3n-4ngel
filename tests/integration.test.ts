import { test, describe } from "node:test";
import assert from "node:assert";

// Retrieve test target URL and API Key from env vars
const targetUrl = process.env.TEST_TARGET_URL || "http://localhost:3000";
const apiKey = process.env.API_KEY || "expenses_adi_secret_9k2mXp7vLqR4";

console.log(`Running integration tests against target: ${targetUrl}`);

describe("Portfolio & Expenses API Integration Tests", () => {
  // 1. Auth Enforcement Tests
  describe("Authentication Enforcement", () => {
    const protectedRoutes = [
      "/api/github",
      "/api/blogs",
      "/api/projects",
      "/api/stats",
      "/api/expenses",
      "/api/expenses/categories",
      "/api/expenses/summary",
      "/api/expenses/breakdown",
      "/api/expenses/search",
    ];

    for (const route of protectedRoutes) {
      test(`GET ${route} without Authorization header returns 401`, async () => {
        const res = await fetch(`${targetUrl}${route}`);
        assert.strictEqual(res.status, 401);
        const body = await res.json();
        assert.strictEqual(body.error, "Unauthorized");
      });

      test(`GET ${route} with invalid Bearer token returns 401`, async () => {
        const res = await fetch(`${targetUrl}${route}`, {
          headers: { Authorization: "Bearer invalid_key_here" },
        });
        assert.strictEqual(res.status, 401);
        const body = await res.json();
        assert.strictEqual(body.error, "Unauthorized");
      });
    }

    test("POST /api/expenses without Authorization header returns 401", async () => {
      const res = await fetch(`${targetUrl}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test", amount: 100 }),
      });
      assert.strictEqual(res.status, 401);
    });

    test("POST /api/expenses/batch without Authorization header returns 401", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: [{ title: "Test", amount: 100 }] }),
      });
      assert.strictEqual(res.status, 401);
    });
  });

  // 2. Health Check & Public Endpoints
  describe("Public & Health Endpoints", () => {
    test("GET /api/health returns 200 or 503", async () => {
      const res = await fetch(`${targetUrl}/api/health`);
      assert.ok(res.status === 200 || res.status === 503, `Expected 200 or 503, got ${res.status}`);
      const body = await res.json();
      assert.ok("ok" in body);
      assert.ok(Array.isArray(body.services));
    });

    test("GET /api/spotify returns 200", async () => {
      const res = await fetch(`${targetUrl}/api/spotify`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.ok("isPlaying" in body);
    });
  });

  // 3. Protected Endpoints (with Valid Key)
  describe("Protected Endpoints (Authenticated)", () => {
    const headers = { Authorization: `Bearer ${apiKey}` };

    test("GET /api/github returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/github`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/blogs returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/blogs`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/projects returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/projects`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/stats returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/stats`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/expenses returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/expenses`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/expenses/categories returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/categories`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/expenses/summary returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/summary`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/expenses/breakdown returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/breakdown`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });

    test("GET /api/expenses/search without parameters returns 400", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/search`, { headers });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.error, "Bad Request");
    });

    test("GET /api/expenses/search with query returns 200 or 500", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/search?q=test`, { headers });
      assert.ok(res.status === 200 || res.status === 500, `Expected 200 or 500, got ${res.status}`);
    });
  });

  // 4. Mutation Endpoints (authenticated)
  describe("Mutation Endpoints (Authenticated Input Validation)", () => {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    test("POST /api/expenses with missing fields returns 400", async () => {
      const res = await fetch(`${targetUrl}/api/expenses`, {
        method: "POST",
        headers,
        body: JSON.stringify({ amount: 100 }), // missing title
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.error, "Bad Request");
    });

    test("POST /api/expenses with invalid amount returns 400", async () => {
      const res = await fetch(`${targetUrl}/api/expenses`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "Test", amount: "not_a_number" }),
      });
      assert.strictEqual(res.status, 400);
    });

    test("POST /api/expenses/batch with invalid structure returns 400", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/batch`, {
        method: "POST",
        headers,
        body: JSON.stringify({ expenses: "not_an_array" }),
      });
      assert.strictEqual(res.status, 400);
    });

    test("PATCH /api/expenses/nonexistent-id with empty body returns 400", async () => {
      const res = await fetch(`${targetUrl}/api/expenses/nonexistent-id`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 400);
    });
  });
});
