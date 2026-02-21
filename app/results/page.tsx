import { ResultsClient } from "@/components/ResultsClient";

export default function ResultsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">AI Analysis Results</h1>
      <ResultsClient initialInput={normalized} />
    </div>
  );
}
