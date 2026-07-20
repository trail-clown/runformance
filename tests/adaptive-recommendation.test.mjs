import assert from "node:assert/strict";
import test from "node:test";

const validContext = {
  plannedWorkout: {
    title: "Progression run · 50 min",
    description: "Build from conversational to strong.",
  },
  readinessScore: 82,
  sleepDurationHours: 7.5,
  hrvTrend: "improving",
  restingHeartRate: 48,
  recentTrainingLoad: 412,
  targetTrainingLoadRange: { min: 450, max: 550 },
  temperatureFahrenheit: 64,
  aqi: 34,
  windMph: 6,
  humidityPercent: 42,
};

test("rejects invalid adaptive runner context before calling OpenAI", async () => {
  const worker = await loadWorker("invalid-context");
  const response = await worker.fetch(
    new Request("http://localhost/api/adaptive-recommendation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validContext, readinessScore: 140 }),
    }),
    workerEnvironment,
    executionContext,
  );

  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_input");
  assert.equal(body.error.fields[0].field, "readinessScore");
  assert.equal(typeof body.error.fields[0].message, "string");
  assert.ok(body.error.fields[0].message.length > 0);
});

test("reports a missing server-side API key without exposing a secret", async () => {
  const previousApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const worker = await loadWorker("missing-api-key");
    const response = await worker.fetch(
      new Request("http://localhost/api/adaptive-recommendation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validContext),
      }),
      workerEnvironment,
      executionContext,
    );
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.deepEqual(body, {
      error: {
        code: "missing_api_key",
        message: "GPT-5.6 re-evaluation is not configured on this server.",
      },
    });
    assert.doesNotMatch(JSON.stringify(body), /OPENAI_API_KEY|sk-/i);
  } finally {
    if (previousApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousApiKey;
    }
  }
});

test("reuses valid safety cookies and replaces missing or malformed values", async () => {
  const previousApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const capturedSafetyIdentifiers = [];
  process.env.OPENAI_API_KEY = "sk-test-not-a-real-key";
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.startsWith("https://api.openai.com/")) {
      capturedSafetyIdentifiers.push(JSON.parse(init.body).safety_identifier);
      return openAISuccessResponse();
    }

    return originalFetch(input, init);
  };

  try {
    const worker = await loadWorker("safety-cookie-validation");
    const firstResponse = await requestRecommendation(worker);
    const firstCookie = getSafetyCookie(firstResponse);

    assert.equal(firstResponse.status, 200);
    assert.match(firstCookie, UUID_PATTERN);

    const repeatResponse = await requestRecommendation(worker, firstCookie);
    assert.equal(repeatResponse.status, 200);
    assert.equal(repeatResponse.headers.get("set-cookie"), null);
    assert.equal(capturedSafetyIdentifiers[0], capturedSafetyIdentifiers[1]);

    const malformedResponse = await requestRecommendation(worker, "not-a-uuid");
    const replacementCookie = getSafetyCookie(malformedResponse);

    assert.equal(malformedResponse.status, 200);
    assert.match(replacementCookie, UUID_PATTERN);
    assert.notEqual(replacementCookie, "not-a-uuid");
    assert.notEqual(capturedSafetyIdentifiers[1], capturedSafetyIdentifiers[2]);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousApiKey;
    }
  }
});

async function requestRecommendation(worker, safetyCookie) {
  const headers = { "content-type": "application/json" };
  if (safetyCookie) {
    headers.cookie = `runformance-safety-id=${safetyCookie}`;
  }

  return worker.fetch(
    new Request("http://localhost/api/adaptive-recommendation", {
      method: "POST",
      headers,
      body: JSON.stringify(validContext),
    }),
    workerEnvironment,
    executionContext,
  );
}

function getSafetyCookie(response) {
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie);
  const match = setCookie.match(/(?:^|;\s*)runformance-safety-id=([^;]+)/);
  assert.ok(match);
  return match[1];
}

function openAISuccessResponse() {
  return new Response(
    JSON.stringify({
      id: "resp_test",
      object: "response",
      created_at: 0,
      status: "completed",
      error: null,
      model: "gpt-5.6",
      output: [
        {
          id: "msg_test",
          type: "message",
          status: "completed",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                decision: "keep",
                recommendedWorkoutTitle: "Progression run",
                recommendedWorkoutDescription:
                  "Complete the planned progression run.",
                summary: "Recovery and conditions support the planned session.",
                reasons: [
                  "Readiness is strong.",
                  "Sleep is adequate.",
                  "Outdoor conditions are favorable.",
                ],
                caution: null,
              }),
              annotations: [],
            },
          ],
        },
      ],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${label}-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const workerEnvironment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
