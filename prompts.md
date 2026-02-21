# Prompt Log

Use this file to track prompts given by the user.

## Past Prompts

- 2026-02-21: "in prompts.md i want you to keep track of the prompts that i gave you in the prompts.md file"
- 2026-02-21: "Update the current prompts have a section with past prompts"
- 2026-02-21: "update the prompts.md with the idea of using ai"
- 2026-02-21: "start building the app do the next prompt using the ai features and make updates to the ai features if you need my api key i can add it to the file and i can answer any questions you have"
- 2026-02-21: "i dont to have the user enter information about the car it will just be from the listing"
- 2026-02-21: "make sure everything up to date and i changed the api form openai to google gemni"


# Current Prompt
Use URL-only listing intake:
- Users should only paste a listing URL.
- Car details should be extracted from the listing automatically.
- Remove manual car data input from the user flow.
- AI provider should use Google Gemini environment variables and API integration.

## Site Features
- Listing intake: paste a URL (dealership, Facebook Marketplace, Craigslist, eBay) or manually enter listing details.
- Listing parser: auto-extract year, make, model, trim, mileage, price, location, seller type, and VIN (when available).
- Fair price score: show if the listing is underpriced, fair, or overpriced based on comparable vehicles.
- Comparable cars panel: display similar listings with price, mileage, distance, and confidence score.
- Total cost estimator: include taxes, registration, insurance estimate, and financing estimate.
- Financing helper: monthly payment calculator with APR/term/down payment controls.
- Inspection checklist: downloadable pre-purchase checklist and red flag tracker.
- Vehicle history integration hook: section for Carfax/AutoCheck-style history signals.
- Deal alerts: notify users when better comps appear or when price drops.
- Save and compare garage: let users save multiple vehicles and compare side-by-side.
- Negotiation assistant: generate talking points using comps and listing weaknesses.
- Trust and risk signals: identify scams, incomplete info, and suspicious pricing patterns.

## AI Features
- AI listing parser: convert messy listing text/URLs into structured fields.
- AI fair-deal scoring: estimate whether price is a good deal based on comps and context.
- AI comparable matching: find and rank the most relevant similar vehicles.
- AI risk detector: flag potential scams, missing details, and suspicious patterns.
- AI negotiation copilot: generate offer strategy, talking points, and seller questions.
- AI Q&A assistant: answer buyer questions using listing + comp + risk data.

## Next Prompt (Build the App)
Build the first version of this app as a web MVP with AI features. Use a modern stack (Next.js + TypeScript + Tailwind). Start with:
1. Project setup and clean folder structure.
2. A homepage with a listing URL input and manual listing form.
3. A results page that shows parsed listing data, AI fair price score, and AI-ranked comparable cars (use mocked data first).
4. A reusable comparison table component for saved cars.
5. Basic state management and local persistence for saved listings.
6. AI endpoints or service stubs for parse, score, compare, and risk-check flows.
7. Clear README instructions for local setup and run.
After scaffolding, implement the UI with clean, responsive design and realistic sample data.
