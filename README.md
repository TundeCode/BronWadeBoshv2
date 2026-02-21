# BronWadeBosh v2

AI-assisted web MVP for evaluating used-car listings and helping buyers make decisions.

## Features in this build
- Listing intake form (URL + manual fields)
- AI parse endpoint stub
- AI fair-deal scoring endpoint stub
- AI comparable ranking endpoint stub
- AI risk-check endpoint (mock by default, optional OpenAI fallback)
- AI negotiation-plan endpoint stub
- AI listing Q&A endpoint stub
- Results dashboard with score, risk panel, and comparable cards
- Saved compare garage persisted in browser `localStorage`

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zod

## Setup
1. Install deps:
```bash
npm install
```
2. Add environment variables:
```bash
cp .env.example .env.local
```
3. (Optional) set `OPENAI_API_KEY` in `.env.local`.
4. Start dev server:
```bash
npm run dev
```

## AI notes
- This MVP defaults to deterministic mocked AI outputs.
- When `OPENAI_API_KEY` is present, the risk endpoint attempts a lightweight OpenAI call.
- Parse/score/compare are structured so you can swap mock logic for model-backed extraction/ranking later.
