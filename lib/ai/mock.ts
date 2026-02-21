import {
  ComparableCar,
  DealScore,
  NegotiationPlan,
  QaResponse,
  RiskAssessment,
  VehicleListing
} from "@/lib/types";

const makes = ["Toyota", "Honda", "Hyundai", "Mazda", "Kia"];
const models = ["Camry", "Accord", "Elantra", "CX-5", "Sportage"];

export function mockParseListing(input: Partial<VehicleListing> & { sourceUrl?: string; rawText?: string }): VehicleListing {
  const title = input.title || "2019 Honda Accord EX";
  const [yearStr = "2019", make = "Honda", model = "Accord", ...trimParts] = title.split(" ");
  const year = Number(yearStr) || 2019;

  return {
    id: crypto.randomUUID(),
    sourceUrl: input.sourceUrl,
    title,
    year,
    make,
    model,
    trim: trimParts.join(" ") || "EX",
    mileage: input.mileage ?? 64000,
    price: input.price ?? 19400,
    location: input.location || "Atlanta, GA",
    vin: input.vin,
    sellerType: input.sellerType || "dealer",
    conditionNotes: input.conditionNotes || "Well maintained, clean title."
  };
}

export function mockComparables(listing: VehicleListing): ComparableCar[] {
  return Array.from({ length: 5 }).map((_, idx) => ({
    id: crypto.randomUUID(),
    year: listing.year + (idx % 2 === 0 ? 0 : -1),
    make: makes[idx % makes.length] || listing.make,
    model: models[idx % models.length] || listing.model,
    trim: listing.trim,
    price: Math.round(listing.price * (0.88 + idx * 0.045)),
    mileage: Math.max(20000, listing.mileage + (idx - 2) * 7000),
    distanceMiles: 5 + idx * 12,
    source: ["Dealer", "Craigslist", "Facebook", "eBay"][idx % 4],
    relevance: Math.max(65, 95 - idx * 6)
  }));
}

export function mockScore(listing: VehicleListing, comps: ComparableCar[]): DealScore {
  const avg = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
  const delta = ((listing.price - avg) / avg) * 100;
  const score = Math.max(1, Math.min(99, Math.round(70 - delta * 2)));

  const label = delta < -7 ? "Great Deal" : delta > 7 ? "Overpriced" : "Fair";

  return {
    label,
    score,
    estimatedFairRange: {
      min: Math.round(avg * 0.93),
      max: Math.round(avg * 1.07)
    },
    confidence: 0.78,
    explanation: `${listing.year} ${listing.make} ${listing.model} sits ${Math.abs(Math.round(delta))}% ${delta <= 0 ? "below" : "above"} nearby market averages.`
  };
}

export function mockRisk(listing: VehicleListing): RiskAssessment {
  const flags: string[] = [];

  if (listing.price < 9000) flags.push("Price is unusually low for segment; verify title and seller identity.");
  if (!listing.vin) flags.push("VIN is missing from listing details.");
  if ((listing.conditionNotes || "").toLowerCase().includes("as-is")) {
    flags.push("Sold as-is; prioritize pre-purchase inspection.");
  }

  return {
    riskLevel: flags.length >= 3 ? "High" : flags.length > 0 ? "Medium" : "Low",
    flags: flags.length ? flags : ["No critical red flags detected from provided inputs."],
    recommendedQuestions: [
      "Can you share service records for the last 2 years?",
      "Any accident history, open recalls, or pending repairs?",
      "Can I have an independent mechanic inspection before purchase?"
    ]
  };
}

export function mockNegotiation(listing: VehicleListing): NegotiationPlan {
  return {
    targetOffer: Math.round(listing.price * 0.92),
    walkAwayPrice: Math.round(listing.price * 1.02),
    talkingPoints: [
      "Comparable listings in nearby zip codes are priced lower.",
      "Use mileage and expected maintenance as negotiation leverage.",
      "Request pre-purchase inspection and adjust offer if repairs are needed."
    ]
  };
}

export function mockQa(listing: VehicleListing, question: string): QaResponse {
  const generic = `Based on this listing (${listing.year} ${listing.make} ${listing.model}), verify records, inspect thoroughly, and compare local comps before committing.`;
  if (!question.trim()) return { answer: generic };

  if (question.toLowerCase().includes("good deal")) {
    return { answer: `Potentially, but confirm with market comps and a mechanic inspection before finalizing.` };
  }

  return { answer: generic };
}
