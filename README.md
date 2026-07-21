# RunFormance

**Better Runs. Better Recovery. Better Health.**

RunFormance is an adaptive endurance coaching prototype that turns fragmented health, workout, race-goal, and environmental signals into one explainable daily recommendation.

**Live demo:** https://runformance.vercel.app

> This Beta Preview uses representative sample data. Apple Health, Garmin Connect, Strava, and environmental integrations are shown as the intended product experience; production OAuth, HealthKit, and live-data services are part of the implementation roadmap.

## The problem

Runners often use several apps but still have to answer the important question themselves: *What should I do today?* Training plans rarely account for sleep, HRV, recent load, soreness, schedule changes, heat, smoke, or rapidly changing air quality at the same time.

RunFormance brings those signals together and explains its decision. It can recommend the best workout window, adjust intensity, substitute cross-training, or advise an indoor session when outdoor conditions are unsafe.

## Prototype capabilities

- Unified readiness and recovery view
- Adaptive workout recommendation with an explainable rationale
- Custom race planning for 5K through ultra distances
- Cross-training and recovery substitutions
- Weather, AQI, smoke, heat, humidity, wind, UV, and pollen-aware guidance
- Optional approximate-location controls and rapid-condition alerts
- Apple Health, Garmin Connect, and Strava connection experience
- Interactive coaching conversation
- Three appearance themes and responsive mobile navigation

## Build Week Adaptive Decision Engine

RunFormance was started from scratch on July 18, 2026, during OpenAI Build Week (July 13–21, 2026). The initial Build Week prototype established the product concept and interface, including Today, Plan, Coach, Connections, the beta waitlist, and feedback functionality.

Commit `7a49b3e` is an early Build Week prototype checkpoint before the Adaptive Decision Engine was implemented. The later Build Week implementation adds a real, isolated GPT-5.6 recommendation service while preserving that initial prototype experience.

On Today, runners can adjust representative recovery, training-load, and environmental values and select **Re-evaluate with GPT-5.6**. A server-only Next.js route validates the context, calls the OpenAI Responses API with the explicit `gpt-5.6-sol` model ID and medium reasoning, and returns a structured `keep`, `modify`, `delay`, or `recover` recommendation with an explanation.

See [BUILD_WEEK_ADAPTIVE_ENGINE.md](BUILD_WEEK_ADAPTIVE_ENGINE.md) for the prototype-checkpoint comparison, API contract, privacy behavior, human/Codex responsibilities, and validation notes.

## Demo walkthrough

1. On **Today**, review readiness, the recommended progression run, and the safest outdoor training window.
2. Select **Start workout** to see the device handoff.
3. Open **Plan** and customize race distance, date, weekly frequency, and goal.
4. Open **Coach**, choose a suggested question, and submit it to see an adaptive cross-training response.
5. Open **Connections** to review data sources, location privacy, and rapid AQI alerts.
6. Switch among Warm, Midnight, and Trail themes.

## Built with Codex and GPT-5.6

David started RunFormance from scratch during Build Week and established the initial product concept and interface. During the same Build Week period, Codex was used as an engineering collaborator for the major Adaptive Decision Engine phase: repository inspection and planning, the server-side OpenAI Responses API integration, structured recommendation contract, interactive UI, validation and tests, privacy and security protections, production diagnostics, debugging, and supporting documentation. GPT-5.6 Sol now powers the live Adaptive Decision Engine in production.

Key human decisions included focusing the product on an explainable daily decision, making location strictly optional, treating wildfire smoke and rapid AQI changes as first-class safety inputs, and supporting distinct visual themes without changing the underlying experience.

## Local setup

Prerequisite: Node.js 22.13 or later.

```bash
npm ci
npm run dev
```

To enable live GPT-5.6 re-evaluation, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. The key is consumed only by the server route; never use a `NEXT_PUBLIC_` variable.

Production validation:

```bash
npm run lint
npm run build
npm run validate:artifact
```

## Architecture

- Next.js 16, React 19, and TypeScript
- Vinext/Vite deployment target
- Responsive, accessible single-page product demo
- CSS custom-property theme system
- Local preference persistence for appearance
- Representative in-browser data for a deterministic judging experience
- Next.js server route using the OpenAI Responses API
- GPT-5.6 Structured Outputs validated with Zod

## Production roadmap

1. Native iOS companion using HealthKit and an Android Health Connect client
2. Approved Garmin Health API and Strava OAuth integrations
3. Live weather, AQI, wildfire smoke, UV, and pollen providers
4. Encrypted user profiles, consent records, and deletion/export controls
5. Platform rate limiting, spend controls, and recommendation-quality evals
6. TestFlight, Play closed testing, and validation with runners and coaches

## Privacy and safety

RunFormance is designed around data minimization, granular consent, optional location, and clear explanations. Health and location data must never be sold or used for advertising. Recommendations are educational fitness guidance and do not replace professional medical advice. See [PRIVACY.md](PRIVACY.md).

## License

This Build Week prototype is provided for judging and demonstration. Add an open-source license before making the repository public for general reuse.

