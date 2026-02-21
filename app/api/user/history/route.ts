import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { addHistoryEntry, listHistory } from "@/lib/db";

const Listing = z.object({
  id: z.string(),
  sourceUrl: z.string().optional(),
  title: z.string(),
  year: z.number(),
  make: z.string(),
  model: z.string(),
  trim: z.string().optional(),
  mileage: z.number(),
  price: z.number(),
  location: z.string(),
  vin: z.string().optional(),
  sellerType: z.enum(["dealer", "private", "marketplace"]),
  conditionNotes: z.string().optional()
});

const Score = z.object({
  label: z.enum(["Great Deal", "Fair", "Overpriced"]),
  score: z.number(),
  estimatedFairRange: z.object({ min: z.number(), max: z.number() }),
  confidence: z.number(),
  explanation: z.string()
});

const Risk = z.object({
  riskLevel: z.enum(["Low", "Medium", "High"]),
  flags: z.array(z.string()),
  recommendedQuestions: z.array(z.string())
});

const Input = z.object({
  listing: Listing,
  dealScore: Score.nullable(),
  risk: Risk.nullable()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await listHistory(user.id);
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = Input.parse(await req.json());
  const entry = await addHistoryEntry({ ...payload, userId: user.id });
  return NextResponse.json({ entry });
}
