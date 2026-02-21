# BronWadeBosh v2

AI-assisted web MVP for evaluating used-car listings and helping buyers make decisions.

## Features in this build
- Listing intake form (URL only)
- AI parse endpoint (Gemini-backed with fallback)
- AI fair-deal scoring endpoint (Gemini-backed with fallback)
- AI comparable ranking endpoint (Gemini-backed with fallback)
- AI risk-check endpoint (Gemini-backed with fallback)
- AI negotiation-plan endpoint (Gemini-backed with fallback)
- AI listing Q&A endpoint (Gemini-backed with fallback)
- Results dashboard with score, risk panel, and comparable cards
- Email/password auth with secure cookie sessions
- User accounts with server-side saved compare garage
- User-specific analysis history

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
3. Set in `.env.local`:
- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=gemini-1.5-flash`
- `AUTH_SECRET=<long-random-secret>`
4. Start dev server:
```bash
npm run dev
```

## AI notes
- If `GEMINI_API_KEY` is missing or a model call fails, endpoints fall back to deterministic mock logic.
- All AI endpoints (`parse`, `score`, `compare`, `risk`, `negotiate`, `qa`) attempt model-backed responses.

## Auth and storage notes
- User account and garage/history data are stored in local JSON files under `data/` for MVP use.
- Session state is stored in an HTTP-only cookie signed with `AUTH_SECRET`.
