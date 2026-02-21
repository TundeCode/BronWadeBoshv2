import { NextResponse } from "next/server";
import { z } from "zod";
import { parseListing } from "@/lib/ai/provider";

const ParseInput = z.object({
  sourceUrl: z.string().optional(),
  title: z.string().optional(),
  year: z.coerce.number().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  trim: z.string().optional(),
  mileage: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  location: z.string().optional(),
  vin: z.string().optional(),
  sellerType: z.enum(["dealer", "private", "marketplace"]).optional(),
  conditionNotes: z.string().optional(),
  rawText: z.string().optional()
});

export async function POST(req: Request) {
  const payload = ParseInput.parse(await req.json());
  const parsed = await parseListing(payload);
  return NextResponse.json(parsed);
}
