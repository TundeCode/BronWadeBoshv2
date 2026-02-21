# Prompt Log

Use this file to track prompts given by the user.

## Past Prompts

- 2026-02-21: "in prompts.md i want you to keep track of the prompts that i gave you in the prompts.md file"


# Current Prompt
I want to make an app that takes in a car listing from maybe a dealership,facebook marketplace, or craiglist or even ebay. Add features that will make it easy for somebody to buy the car. Maybe give them comparison of other similiar cars with the same target audience or if they are getting a good deal or not. 

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

## Next Prompt (Build the App)
Build the first version of this app as a web MVP. Use a modern stack (Next.js + TypeScript + Tailwind). Start with:
1. Project setup and clean folder structure.
2. A homepage with a listing URL input and manual listing form.
3. A results page that shows parsed listing data, fair price score, and comparable cars (use mocked data first).
4. A reusable comparison table component for saved cars.
5. Basic state management and local persistence for saved listings.
6. Clear README instructions for local setup and run.
After scaffolding, implement the UI with clean, responsive design and realistic sample data.
