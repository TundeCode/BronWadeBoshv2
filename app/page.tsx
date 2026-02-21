import Link from "next/link";
import { ListingInputForm } from "@/components/ListingInputForm";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">BronWadeBosh AI Buyer Assistant</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">Analyze car listings and buy with confidence</h1>
        <p className="max-w-3xl text-slate-700">Paste a listing URL or enter details manually. The app uses AI flows to parse listing details, estimate fair value, rank comparables, and flag buying risks.</p>
      </header>

      <ListingInputForm />

      <footer>
        <Link href="/results" className="text-sm font-medium text-slate-700 underline underline-offset-2">Preview results page with defaults</Link>
      </footer>
    </div>
  );
}
