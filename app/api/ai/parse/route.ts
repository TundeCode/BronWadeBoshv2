import { NextResponse } from "next/server";
import { z } from "zod";
import { parseListing } from "@/lib/ai/provider";

const ParseInput = z.object({
  sourceUrl: z.string().url(),
  rawText: z.string().optional()
});

export async function POST(req: Request) {
  const payload = ParseInput.parse(await req.json());
  const parsed = await parseListing(payload);
  return NextResponse.json(parsed);
}
