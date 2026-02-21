"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ListingInputForm() {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ sourceUrl });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-md backdrop-blur">
      <div>
        <label className="mb-1 block text-sm font-medium">Listing URL</label>
        <input
          className="w-full"
          placeholder="https://www.craigslist.org/... or https://www.ebay.com/..."
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          type="url"
          required
        />
        <p className="mt-2 text-xs text-slate-600">Paste a listing link. The app will parse details automatically.</p>
      </div>

      <div>
        <button className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90" type="submit">
          Analyze Listing with AI
        </button>
      </div>
    </form>
  );
}
