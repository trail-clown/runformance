# RunFormance — OpenAI Build Week Submission Draft

## Category

Apps for Your Life

## Tagline

Better Runs. Better Recovery. Better Health.

## One-line summary

RunFormance turns the health, training, race, and environmental data runners already generate into one adaptive, explainable daily coaching decision.

## Inspiration

Runners have more data than ever but still make critical training decisions by manually comparing multiple apps. A training plan may prescribe intervals while sleep and HRV suggest recovery—or while wildfire smoke makes the planned outdoor session unsafe. RunFormance was inspired by the gap between having data and receiving a useful, context-aware decision.

## What it does

RunFormance combines recovery indicators, recent training load, race goals, schedule constraints, and optional local conditions. It recommends what to do, when to do it, and why. The Today experience now includes a real GPT-5.6 Adaptive Decision Engine: runners can change representative recovery and environmental inputs, request a live re-evaluation, and receive a structured keep, modify, delay, or recover decision with three signal-specific reasons.

The prototype demonstrates connections to Apple Health, Garmin Connect, and Strava, alongside optional location-based weather, AQI, smoke, heat, humidity, wind, UV, and pollen guidance. During fire season, rapidly changing air quality can turn a morning outdoor workout into an unsafe afternoon session; RunFormance treats that change as a primary planning input rather than an afterthought.

## How we built it

David started creating RunFormance from scratch on July 18, 2026, during OpenAI Build Week (July 13–21, 2026). The initial Build Week prototype established the product concept and interface: Today, Plan, Coach, Connections, a beta waitlist, and feedback functionality. Commit `7a49b3e` records an early Build Week prototype checkpoint before the GPT-5.6 Adaptive Decision Engine was implemented.

During the same Build Week period, David made the core product and safety decisions for the Adaptive Decision Engine: center the experience on one explainable daily action, keep location optional, preserve the initial prototype experience, use GPT-5.6 Sol with medium reasoning, expose editable recovery and environmental inputs, and clearly separate educational guidance from medical advice. Codex was used for this major implementation phase: it inspected the repository and planned the work, verified the Responses API and installed SDK contract, implemented the server-side integration, structured recommendation contract and interactive UI, added validation and tests, strengthened privacy and production diagnostics, and helped debug production issues. This does not imply that Codex built every part of the initial prototype.

GPT-5.6 Sol now powers the live Adaptive Decision Engine in production. Production testing demonstrated `KEEP` under favorable conditions and `MODIFY` when environmental conditions such as AQI became unsafe.

The prototype uses Next.js, React, TypeScript, Vinext/Vite, and a tokenized CSS theme system. Representative sample data creates a reliable judge experience without requiring access to personal health accounts.

The repository evidence preserves the initial prototype checkpoint (`7a49b3e`), the Adaptive Decision Engine implementation (`4181b7c`), the explicit GPT-5.6 Sol update (`d9c8599`), privacy-safe production diagnostics (`d7d8caa`), and the production safety-identifier fix (`2b5d347`). The main Codex Session ID is documented separately in the Devpost submission.

## Challenges

The central design challenge was making many signals understandable without creating another overwhelming analytics dashboard. The solution was to organize the experience around a single decision—today's workout—and then expose the evidence behind it. Another challenge was incorporating location intelligently while keeping it optional and privacy-preserving.

## Accomplishments

- A coherent end-to-end product experience rather than a static concept
- Explainable recommendations grounded in recovery, load, goals, and conditions
- First-class wildfire smoke and rapidly changing AQI guidance
- Custom race planning and cross-training substitutions
- Three full visual themes with consistent behavior
- Responsive desktop and mobile experiences
- Public, no-login demo with deterministic sample data
- Live GPT-5.6 Responses API recommendation with validated Structured Outputs
- Transparent input-change comparison, failure handling, and educational guidance disclaimer

## What we learned

Personalization is most useful when it reduces decisions, not when it adds more charts. Environmental context can be as important as physiological readiness, especially for runners in regions affected by wildfire smoke and extreme heat. Trust also depends on explaining why a recommendation changed and allowing the user to control every sensitive data source.

## What's next

The next phase is live integration: native HealthKit and Health Connect clients, Garmin and Strava OAuth, environmental data providers, encrypted user profiles, platform rate limiting and spend controls, and representative recommendation-quality evals. After a small runner-and-coach beta, RunFormance would move through TestFlight and Google Play closed testing.

## Links to complete before submission

- Live demo: https://runformance.vercel.app
- Repository: [ADD GITHUB URL]
- Public demo video: [ADD YOUTUBE URL]
- Codex `/feedback` session ID: [ADD SESSION ID]
