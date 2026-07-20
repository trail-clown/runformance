# RunFormance Privacy and Responsible Guidance Principles

RunFormance is currently a product prototype using representative sample data. It does not currently retrieve personal data from the services depicted in the demo.

## Build Week GPT-5.6 demo

The AI Adaptive Recommendation experience sends only the workout, recovery, training-load, and environmental values visibly presented in its sample form to the OpenAI Responses API. It does not send names, email addresses, Formspree waitlist or feedback data, precise routes, or unrelated profile information.

The OpenAI API key remains on the server. The API request uses an opaque `safety_identifier` derived from a validated random UUID in an HTTP-only cookie rather than a name, email address, or health value. RunFormance sets `store: false`, which means it does not ask the Responses API to retain the response as application state for later retrieval. This setting does not guarantee zero data retention; OpenAI API data handling remains governed by the account's applicable data controls and [OpenAI API data policies](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint). Failed GPT requests are shown as failures and are never silently replaced with content presented as AI-generated.

A production release will follow these principles:

- Collect only the data required for a user-selected feature.
- Request granular, revocable permission for each health and activity category.
- Keep approximate location optional and avoid requiring precise routes.
- Never sell health, activity, or location data or use it for advertising.
- Encrypt sensitive data in transit and at rest.
- Provide clear export and permanent deletion controls.
- Explain which signals caused a recommendation to change.
- Separate fitness education from medical diagnosis or treatment.
- Apply conservative guardrails for poor air quality, extreme heat, injury signals, and other potentially unsafe conditions.

RunFormance recommendations are educational and informational. They do not replace advice from a physician or other qualified healthcare professional.
