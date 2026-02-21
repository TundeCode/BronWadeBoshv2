import {
  mockComparables,
  mockNegotiation,
  mockParseListing,
  mockQa,
  mockRisk,
  mockScore
} from "@/lib/ai/mock";
import {
  ComparableCar,
  DealScore,
  NegotiationPlan,
  QaResponse,
  RiskAssessment,
  VehicleListing
} from "@/lib/types";

const OPENAI_URL = "https://api.openai.com/v1/responses";

export async function parseListing(input: Partial<VehicleListing> & { sourceUrl?: string; rawText?: string }) {
  return mockParseListing(input);
}

export async function buildComparables(listing: VehicleListing): Promise<ComparableCar[]> {
  return mockComparables(listing);
}

export async function buildDealScore(listing: VehicleListing, comps: ComparableCar[]): Promise<DealScore> {
  return mockScore(listing, comps);
}

export async function buildRiskAssessment(listing: VehicleListing): Promise<RiskAssessment> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return mockRisk(listing);

  try {
    const prompt = `Evaluate risk level (Low/Medium/High) for this used car listing and provide 3 concise buyer questions. Listing: ${JSON.stringify(listing)}`;
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!res.ok) return mockRisk(listing);
    const data = (await res.json()) as { output_text?: string };
    const text = data.output_text || "";

    return {
      riskLevel: text.toLowerCase().includes("high") ? "High" : text.toLowerCase().includes("medium") ? "Medium" : "Low",
      flags: ["AI summary generated from listing context."],
      recommendedQuestions: [
        "What repairs were completed in the past year?",
        "Can you provide maintenance invoices?",
        "Will you allow a third-party inspection?"
      ]
    };
  } catch {
    return mockRisk(listing);
  }
}

export async function buildNegotiationPlan(listing: VehicleListing): Promise<NegotiationPlan> {
  return mockNegotiation(listing);
}

export async function answerListingQuestion(
  listing: VehicleListing,
  question: string
): Promise<QaResponse> {
  return mockQa(listing, question);
}
