import { NextResponse } from "next/server";
import { z } from "zod";
import { answerListingQuestion } from "@/lib/ai/provider";

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
  }),
  question: z.string().min(1)
});

export async function POST(req: Request) {
  const { listing, question } = Input.parse(await req.json());
  const result = await answerListingQuestion(listing, question);
  return NextResponse.json(result);
}
