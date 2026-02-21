"use client";

import { VehicleListing } from "@/lib/types";

export function ComparisonTable({ items }: { items: VehicleListing[] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-600">No saved listings yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-3 py-2">Vehicle</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Mileage</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Seller</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-3 py-2">{item.year} {item.make} {item.model} {item.trim || ""}</td>
              <td className="px-3 py-2">${item.price.toLocaleString()}</td>
              <td className="px-3 py-2">{item.mileage.toLocaleString()} mi</td>
              <td className="px-3 py-2">{item.location}</td>
              <td className="px-3 py-2 capitalize">{item.sellerType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
