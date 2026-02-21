import { NextResponse } from "next/server";
import { z } from "zod";
import { buildRiskAssessment } from "@/lib/ai/provider";

const Input = z.object({
  listing: z.object({
    id: z.string(),
    title: z.string(),
    year: z.number(),
    make: z.string(),
    model: z.string(),
    trim: z.string().optional(),
    mileage: z.number(),
    price: z.number(),
    location: z.string(),
    sourceUrl: z.string().optional(),
    vin: z.string().optional(),
    sellerType: z.enum(["dealer", "private", "marketplace"]),
    conditionNotes: z.string().optional()
  })
});

export async function POST(req: Request) {
  const { listing } = Input.parse(await req.json());
  const risk = await buildRiskAssessment(listing);
  return NextResponse.json({ risk });
}
