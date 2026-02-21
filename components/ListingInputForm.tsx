"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ListingInputForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    sourceUrl: "",
    title: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    mileage: "",
    price: "",
    location: "",
    vin: "",
    sellerType: "dealer",
    conditionNotes: ""
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-md backdrop-blur md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Listing URL</label>
        <input
          className="w-full"
          placeholder="https://..."
          value={form.sourceUrl}
          onChange={(e) => setForm((s) => ({ ...s, sourceUrl: e.target.value }))}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          className="w-full"
          placeholder="2019 Honda Accord EX"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
        />
      </div>

      {[
        ["year", "Year"],
        ["make", "Make"],
        ["model", "Model"],
        ["trim", "Trim"],
        ["mileage", "Mileage"],
        ["price", "Price"],
        ["location", "Location"],
        ["vin", "VIN"]
      ].map(([key, label]) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium">{label}</label>
          <input
            className="w-full"
            value={(form as Record<string, string>)[key]}
            onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
          />
        </div>
      ))}

      <div>
        <label className="mb-1 block text-sm font-medium">Seller Type</label>
        <select
          className="w-full"
          value={form.sellerType}
          onChange={(e) => setForm((s) => ({ ...s, sellerType: e.target.value }))}
        >
          <option value="dealer">Dealer</option>
          <option value="private">Private</option>
          <option value="marketplace">Marketplace</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Condition Notes</label>
        <input
          className="w-full"
          value={form.conditionNotes}
          onChange={(e) => setForm((s) => ({ ...s, conditionNotes: e.target.value }))}
          placeholder="accident-free, new tires..."
        />
      </div>

      <div className="md:col-span-2">
        <button className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90" type="submit">
          Analyze Listing with AI
        </button>
      </div>
    </form>
  );
}
