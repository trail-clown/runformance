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

RunFormance combines recovery indicators, recent training load, race goals, schedule constraints, and optional local conditions. It recommends what to do, when to do it, and why. The experience includes adaptive running and cross-training plans, readiness and recovery guidance, race-plan customization, weather and air-quality-aware timing, indoor alternatives, and a conversational coach.

The prototype demonstrates connections to Apple Health, Garmin Connect, and Strava, alongside optional location-based weather, AQI, smoke, heat, humidity, wind, UV, and pollen guidance. During fire season, rapidly changing air quality can turn a morning outdoor workout into an unsafe afternoon session; RunFormance treats that change as a primary planning input rather than an afterthought.

## How we built it

The project was designed and implemented with Codex and GPT-5.6. Codex helped turn the original product idea into a coherent information architecture, generate and compare three visual directions, implement the responsive React experience, build the adaptive planner and coaching interactions, debug and validate the production build, deploy the public demo, and prepare the judging materials.

The prototype uses Next.js, React, TypeScript, Vinext/Vite, and a tokenized CSS theme system. Representative sample data creates a reliable judge experience without requiring access to personal health accounts.

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

## What we learned

Personalization is most useful when it reduces decisions, not when it adds more charts. Environmental context can be as important as physiological readiness, especially for runners in regions affected by wildfire smoke and extreme heat. Trust also depends on explaining why a recommendation changed and allowing the user to control every sensitive data source.

## What's next

The next phase is live integration: native HealthKit and Health Connect clients, Garmin and Strava OAuth, environmental data providers, encrypted user profiles, and a GPT-5.6 recommendation service with structured safety checks. After a small runner-and-coach beta, RunFormance would move through TestFlight and Google Play closed testing.

## Links to complete before submission

- Live demo: https://stridewise-coach.dill75208.chatgpt.site
- Repository: [ADD GITHUB URL]
- Public demo video: [ADD YOUTUBE URL]
- Codex `/feedback` session ID: [ADD SESSION ID]
