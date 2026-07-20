# RunFormance Build Week Adaptive Decision Engine

## Build boundary

The documented pre-Build-Week baseline is commit `7a49b3e` (`Add beta feedback channel`). That commit is the comparison point for all work in this document.

At the baseline, RunFormance already included:

- Today, Plan, Coach, and Connections views
- deterministic representative workout, readiness, recovery, load, and environmental data
- three visual themes and responsive desktop/mobile navigation
- beta waitlist and feedback forms powered by Formspree
- a simulated coaching conversation and device handoff
- no production adaptive recommendation API and no OpenAI SDK dependency

## Build Week additions

Build Week adds a real GPT-5.6-powered Adaptive Decision Engine without replacing the existing prototype:

- an isolated `AI Adaptive Recommendation` component on Today
- editable sample recovery, training-load, and outdoor-condition inputs
- a same-origin Next.js POST route at `/api/adaptive-recommendation`
- the OpenAI Responses API using the explicit model ID `gpt-5.6-sol`
- explicit `reasoning.effort: "medium"`
- Structured Outputs validated with Zod
- an explainable decision of `keep`, `modify`, `delay`, or `recover`
- a recommended workout, concise summary, exactly three reasons, and nullable caution
- comparison of the last evaluated inputs so the UI shows what changed
- explicit loading, timeout, validation, refusal, incomplete-response, parsing, configuration, and upstream-error states
- a clear GPT-5.6 label and educational-not-medical disclaimer

## OpenAI integration

The project directly depends on `openai@6.48.0` and `zod@4.4.3`. Before the API route was written, the installed SDK declarations and source were checked to confirm the current official Responses pattern:

```ts
openai.responses.parse(
  {
    model: "gpt-5.6-sol",
    reasoning: { effort: "medium" },
    text: { format: zodTextFormat(schema, "adaptive_recommendation") },
  },
  { timeout: 25_000, maxRetries: 0 },
);
```

The route sets `store: false`, so RunFormance does not ask the Responses API to retain the response as application state for later retrieval. This setting does not guarantee zero data retention: OpenAI may separately process or retain API data for abuse monitoring, legal obligations, or other purposes governed by the account's applicable data controls and [OpenAI API data policies](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint). A successful response is accepted only when the response is complete, contains no refusal, and passes the recommendation schema. Failed model calls are never replaced with content presented as AI-generated.

## Request context sent to OpenAI

Only these validated values are transmitted:

- planned workout title and description
- readiness score
- sleep duration in hours
- HRV trend
- resting heart rate
- recent training load
- target training-load minimum and maximum
- temperature in Fahrenheit
- AQI
- wind in miles per hour
- humidity percentage

RunFormance does not include names, email addresses, Formspree submissions, profile labels, routes, or unrelated application state in the GPT request.

## Privacy and safety

`OPENAI_API_KEY` is read only inside the server route. It is not included in browser code, `NEXT_PUBLIC_` variables, logs, API responses, or documentation. `.env*` files are ignored while `.env.example` contains only an empty placeholder.

For a valid end-user evaluation, the server reuses an existing UUID-formatted HTTP-only same-site cookie or replaces a missing or malformed value with a new random UUID. It hashes that random value with SHA-256 and sends the resulting opaque value as `safety_identifier`. The identifier contains no name, email address, health value, or other direct personal information.

Recommendations are educational fitness guidance, not diagnosis or treatment. The prompt requires conservative handling of poor recovery, excessive load, unhealthy air quality, and extreme environmental conditions. The interface repeats that recommendations are not medical advice.

## Human and Codex responsibilities

Product, design, and engineering decisions made by David include:

- centering the product on one explainable daily decision
- preserving the existing four-view prototype and visual system
- using the explicit `gpt-5.6-sol` model ID with medium reasoning
- making recovery and environmental sample inputs editable
- keeping the API key and safety identifier server-side/private
- requiring transparent failure states and preservation of the last successful result
- keeping location optional and recommendations educational rather than medical
- deferring broad authentication and distributed rate limiting from this focused feature

Codex was used to:

- inspect the full repository and git history
- verify current official GPT-5.6 and Structured Outputs guidance
- install and inspect the exact OpenAI Node SDK version and type declarations
- implement the shared schemas, server route, client component, responsive styling, and tests
- document the baseline boundary, architecture, privacy behavior, and validation evidence
- run TypeScript, lint, test, build, and diff validation without committing or pushing

## Failure behavior

The server returns explicit, non-secret error codes and messages for:

- missing `OPENAI_API_KEY`
- invalid JSON or out-of-range/missing context
- OpenAI API failures
- model refusal
- incomplete response
- structured-output parsing failure
- request timeout

The client prevents duplicate submissions, applies a 30-second browser timeout, and leaves the last successful recommendation visible when a later evaluation fails.

## Local configuration

Create `.env.local` from `.env.example` and set `OPENAI_API_KEY` in the local environment. Never commit `.env.local` or use a `NEXT_PUBLIC_` prefix.

## Validation

The intended validation commands are:

```bash
npx tsc --noEmit --incremental false
npm run lint
npm test
npm run build
git diff --stat 7a49b3e
```

The Vinext/Sites production build additionally requires the environment-provided `.openai/hosting.json` manifest referenced by `vite.config.ts`.

## Production-hardening follow-up

- configure platform-level request rate limits and OpenAI project spend alerts
- add representative recommendation evals for recovery and environmental edge cases
- monitor latency, refusal, timeout, and schema-failure rates without logging sensitive context
- verify deployment secret injection and GPT-5.6 project access
- review data-processing disclosures before using real runner health data
