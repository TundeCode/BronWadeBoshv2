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

function extractJsonObject<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function extractJsonArray<T>(text: string): T[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T[];
  } catch {
    return null;
  }
}

function maskKey(key: string): string {
  if (key.length <= 10) return "***";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

async function callGemini(task: string, prompt: string): Promise<string | null> {
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = rawKey?.replace(/^"(.*)"$/, "$1");
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  console.log(`[AI][${task}] starting`, {
    hasKey: Boolean(apiKey),
    keyPreview: apiKey ? maskKey(apiKey) : null,
    model
  });

  if (!apiKey) {
    console.log(`[AI][${task}] missing GEMINI_API_KEY; using fallback`);
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "You are a strict JSON generator.",
                  "Return only valid JSON with no markdown fences and no extra text.",
                  prompt
                ].join("\n")
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.log(`[AI][${task}] Gemini request failed`, {
        status: res.status,
        statusText: res.statusText,
        bodySnippet: errorBody.slice(0, 300)
      });
      return null;
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "";

    console.log(`[AI][${task}] Gemini response received`, {
      hasText: Boolean(text),
      textLength: text.length
    });

    return text || null;
  } catch (error) {
    console.log(`[AI][${task}] Gemini exception`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

function normalizeListing(base: VehicleListing, input: Partial<VehicleListing>): VehicleListing {
  return {
    ...base,
    ...input,
    id: base.id,
    title: input.title || base.title,
    year: Number(input.year || base.year),
    make: input.make || base.make,
    model: input.model || base.model,
    trim: input.trim || base.trim,
    mileage: Number(input.mileage || base.mileage),
    price: Number(input.price || base.price),
    location: input.location || base.location,
    sellerType: input.sellerType || base.sellerType,
    sourceUrl: input.sourceUrl || base.sourceUrl,
    vin: input.vin || base.vin,
    conditionNotes: input.conditionNotes || base.conditionNotes
  };
}

async function fetchListingSnapshot(sourceUrl: string): Promise<string> {
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html.replace(/\s+/g, " ").slice(0, 12000);
  } catch {
    return "";
  }
}

function deriveListingFromUrl(sourceUrl: string): Partial<VehicleListing> {
  try {
    const url = new URL(sourceUrl);
    const text = decodeURIComponent(`${url.hostname} ${url.pathname} ${url.search}`)
      .replace(/[-_+/.,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
    const makeModelPatterns: Array<{ make: string; model: string }> = [
      { make: "Honda", model: "Accord" },
      { make: "Honda", model: "Civic" },
      { make: "Toyota", model: "Camry" },
      { make: "Toyota", model: "Corolla" },
      { make: "Nissan", model: "Altima" },
      { make: "Ford", model: "F-150" },
      { make: "Chevrolet", model: "Silverado" }
    ];

    const matched = makeModelPatterns.find((p) =>
      new RegExp(`\\b${p.make.toLowerCase()}\\b.*\\b${p.model.toLowerCase().replace("-", "[- ]?")}\\b`).test(
        text.toLowerCase()
      )
    );

    const sellerType: VehicleListing["sellerType"] =
      url.hostname.includes("dealer")
        ? "dealer"
        : url.hostname.includes("craigslist") || url.hostname.includes("facebook")
          ? "marketplace"
          : "private";

    return {
      title: [yearMatch?.[1], matched?.make, matched?.model].filter(Boolean).join(" ") || "Used vehicle listing",
      year: yearMatch ? Number(yearMatch[1]) : undefined,
      make: matched?.make,
      model: matched?.model,
      sellerType
    };
  } catch {
    return {};
  }
}

export async function parseListing(input: { sourceUrl: string; rawText?: string }) {
  const urlDerived = deriveListingFromUrl(input.sourceUrl);
  const fallback = mockParseListing({ ...urlDerived, ...input });
  const listingPageText = input.rawText || (await fetchListingSnapshot(input.sourceUrl));
  const text = await callGemini(
    "parse",
    `Extract vehicle listing fields as JSON with keys: title, year, make, model, trim, mileage, price, location, vin, sellerType, conditionNotes.
sourceUrl: ${input.sourceUrl}
listingPageText: ${listingPageText || "N/A"}
sellerType must be one of dealer|private|marketplace.
If a field is missing, infer conservatively.`
  );
  if (!text) return fallback;

  const parsed = extractJsonObject<Partial<VehicleListing>>(text);
  if (!parsed) return fallback;
  return normalizeListing(fallback, parsed);
}

export async function buildComparables(listing: VehicleListing): Promise<ComparableCar[]> {
  const fallback = mockComparables(listing);
  const text = await callGemini(
    "compare",
    `Generate 5 comparable used vehicles as a JSON array. Each item must have keys: year, make, model, trim, price, mileage, distanceMiles, source, relevance. Keep relevance 0-100. Target listing: ${JSON.stringify(
      listing
    )}`
  );
  if (!text) return fallback;

  const parsed = extractJsonArray<Omit<ComparableCar, "id">>(text);
  if (!parsed) return fallback;

  const safe = parsed
    .slice(0, 5)
    .map((item) => ({
      id: crypto.randomUUID(),
      year: Number(item.year || listing.year),
      make: item.make || listing.make,
      model: item.model || listing.model,
      trim: item.trim || listing.trim,
      price: Math.max(1000, Number(item.price || listing.price)),
      mileage: Math.max(0, Number(item.mileage || listing.mileage)),
      distanceMiles: Math.max(0, Number(item.distanceMiles || 0)),
      source: item.source || "marketplace",
      relevance: Math.max(1, Math.min(100, Number(item.relevance || 70)))
    }))
    .filter((i) => i.make && i.model);

  return safe.length ? safe : fallback;
}

export async function buildDealScore(listing: VehicleListing, comps: ComparableCar[]): Promise<DealScore> {
  const fallback = mockScore(listing, comps);
  const text = await callGemini(
    "score",
    `Return deal score JSON with keys: label (Great Deal|Fair|Overpriced), score (1-99), estimatedFairRange {min,max}, confidence (0-1), explanation. Listing: ${JSON.stringify(
      listing
    )}. Comparables: ${JSON.stringify(comps)}`
  );
  if (!text) return fallback;

  const parsed = extractJsonObject<Partial<DealScore>>(text);
  if (!parsed) return fallback;

  const label = parsed.label;
  if (label !== "Great Deal" && label !== "Fair" && label !== "Overpriced") return fallback;

  return {
    label,
    score: Math.max(1, Math.min(99, Number(parsed.score || fallback.score))),
    estimatedFairRange: {
      min: Math.max(1000, Number(parsed.estimatedFairRange?.min || fallback.estimatedFairRange.min)),
      max: Math.max(1000, Number(parsed.estimatedFairRange?.max || fallback.estimatedFairRange.max))
    },
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? fallback.confidence))),
    explanation: parsed.explanation || fallback.explanation
  };
}

export async function buildRiskAssessment(listing: VehicleListing): Promise<RiskAssessment> {
  const fallback = mockRisk(listing);
  const text = await callGemini(
    "risk",
    `Return risk assessment JSON with keys: riskLevel (Low|Medium|High), flags (string[]), recommendedQuestions (string[]). Listing: ${JSON.stringify(
      listing
    )}`
  );
  if (!text) return fallback;

  const parsed = extractJsonObject<Partial<RiskAssessment>>(text);
  if (!parsed) return fallback;

  const riskLevel = parsed.riskLevel;
  if (riskLevel !== "Low" && riskLevel !== "Medium" && riskLevel !== "High") return fallback;

  return {
    riskLevel,
    flags: Array.isArray(parsed.flags) && parsed.flags.length ? parsed.flags.map(String) : fallback.flags,
    recommendedQuestions:
      Array.isArray(parsed.recommendedQuestions) && parsed.recommendedQuestions.length
        ? parsed.recommendedQuestions.map(String)
        : fallback.recommendedQuestions
  };
}

export async function buildNegotiationPlan(listing: VehicleListing): Promise<NegotiationPlan> {
  const fallback = mockNegotiation(listing);
  const text = await callGemini(
    "negotiate",
    `Return negotiation plan JSON with keys: targetOffer (number), walkAwayPrice (number), talkingPoints (string[]). Listing: ${JSON.stringify(
      listing
    )}`
  );
  if (!text) return fallback;

  const parsed = extractJsonObject<Partial<NegotiationPlan>>(text);
  if (!parsed) return fallback;

  return {
    targetOffer: Math.max(1000, Number(parsed.targetOffer || fallback.targetOffer)),
    walkAwayPrice: Math.max(1000, Number(parsed.walkAwayPrice || fallback.walkAwayPrice)),
    talkingPoints:
      Array.isArray(parsed.talkingPoints) && parsed.talkingPoints.length
        ? parsed.talkingPoints.map(String)
        : fallback.talkingPoints
  };
}

export async function answerListingQuestion(
  listing: VehicleListing,
  question: string
): Promise<QaResponse> {
  const fallback = mockQa(listing, question);
  const text = await callGemini(
    "qa",
    `Answer this buyer question in 2-4 concise sentences. Return JSON with key: answer. Listing: ${JSON.stringify(
      listing
    )}. Question: ${question}`
  );
  if (!text) return fallback;

  const parsed = extractJsonObject<Partial<QaResponse>>(text);
  if (!parsed?.answer) return fallback;

  return { answer: parsed.answer };
}
