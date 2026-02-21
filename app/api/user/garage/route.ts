import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { deleteSavedListing, listSavedListings, saveListing } from "@/lib/db";

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

const Input = z.object({ listing: Listing });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await listSavedListings(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listing } = Input.parse(await req.json());
  const item = await saveListing(user.id, listing);
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  await deleteSavedListing(user.id, listingId);
  return NextResponse.json({ ok: true });
}
