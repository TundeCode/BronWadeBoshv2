"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnalysisHistoryEntry,
  ComparableCar,
  DealScore,
  NegotiationPlan,
  QaResponse,
  RiskAssessment,
  UserPublic,
  VehicleListing
} from "@/lib/types";
import { ComparisonTable } from "@/components/ComparisonTable";

type Props = {
  initialInput: Record<string, string | undefined>;
};

export function ResultsClient({ initialInput }: Props) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [listing, setListing] = useState<VehicleListing | null>(null);
  const [comparables, setComparables] = useState<ComparableCar[]>([]);
  const [dealScore, setDealScore] = useState<DealScore | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationPlan | null>(null);
  const [question, setQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState<QaResponse | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [saved, setSaved] = useState<VehicleListing[]>([]);
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [analysisStored, setAnalysisStored] = useState(false);

  useEffect(() => {
    async function loadMe() {
      const res = await fetch("/api/auth/me");
      const data = (await res.json()) as { user: UserPublic | null };
      setUser(data.user);
    }
    void loadMe();
  }, []);

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setSaved([]);
        setHistory([]);
        return;
      }

      const [garageRes, historyRes] = await Promise.all([
        fetch("/api/user/garage"),
        fetch("/api/user/history")
      ]);

      if (garageRes.ok) {
        const garageData = (await garageRes.json()) as { items: { listing: VehicleListing }[] };
        setSaved(garageData.items.map((item) => item.listing));
      }

      if (historyRes.ok) {
        const historyData = (await historyRes.json()) as { entries: AnalysisHistoryEntry[] };
        setHistory(historyData.entries);
      }
    }

    void loadUserData();
  }, [user]);

  useEffect(() => {
    async function runAnalysis() {
      setLoading(true);
      const parseRes = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialInput)
      });
      const parsed = (await parseRes.json()) as VehicleListing;
      setListing(parsed);

      const [compRes, scoreRes, riskRes, negotiationRes] = await Promise.all([
        fetch("/api/ai/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing: parsed })
        }),
        fetch("/api/ai/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing: parsed })
        }),
        fetch("/api/ai/risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing: parsed })
        }),
        fetch("/api/ai/negotiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing: parsed })
        })
      ]);

      const compData = (await compRes.json()) as { comparables: ComparableCar[] };
      const scoreData = (await scoreRes.json()) as { score: DealScore };
      const riskData = (await riskRes.json()) as { risk: RiskAssessment };
      const negotiationData = (await negotiationRes.json()) as { plan: NegotiationPlan };

      setComparables(compData.comparables);
      setDealScore(scoreData.score);
      setRisk(riskData.risk);
      setNegotiation(negotiationData.plan);

      setAnalysisStored(false);
      setLoading(false);
    }

    void runAnalysis();
  }, [initialInput]);

  useEffect(() => {
    async function storeHistory() {
      if (!user || !listing || !dealScore || !risk || analysisStored) return;
      const res = await fetch("/api/user/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing, dealScore, risk })
      });
      if (res.ok) {
        setAnalysisStored(true);
        const historyRes = await fetch("/api/user/history");
        if (historyRes.ok) {
          const historyData = (await historyRes.json()) as { entries: AnalysisHistoryEntry[] };
          setHistory(historyData.entries);
        }
      }
    }

    void storeHistory();
  }, [user, listing, dealScore, risk, analysisStored]);

  const canSave = !!listing && !!user;

  const saveCurrent = async () => {
    setAuthMessage("");
    if (!listing) return;
    if (!user) {
      setAuthMessage("Sign in on the home page to save listings to your account.");
      return;
    }

    const res = await fetch("/api/user/garage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing })
    });

    if (!res.ok) {
      setAuthMessage("Could not save listing.");
      return;
    }

    const garageRes = await fetch("/api/user/garage");
    const garageData = (await garageRes.json()) as { items: { listing: VehicleListing }[] };
    setSaved(garageData.items.map((item) => item.listing));
    setAuthMessage("Saved to your garage.");
  };

  const askQuestion = async () => {
    if (!listing || !question.trim()) return;
    setQaLoading(true);
    const res = await fetch("/api/ai/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing, question })
    });
    setQaAnswer(await res.json());
    setQaLoading(false);
  };

  const dealClass = useMemo(() => {
    if (!dealScore) return "bg-slate-100";
    if (dealScore.label === "Great Deal") return "bg-emerald-100 text-emerald-800";
    if (dealScore.label === "Overpriced") return "bg-rose-100 text-rose-800";
    return "bg-amber-100 text-amber-800";
  }, [dealScore]);

  if (loading) return <p className="text-sm text-slate-700">Running AI analysis...</p>;
  if (!listing) return <p className="text-sm text-rose-700">Could not parse listing details.</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{listing.year} {listing.make} {listing.model} {listing.trim || ""}</h2>
          <button
            type="button"
            disabled={!canSave}
            onClick={saveCurrent}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save to Compare Garage
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">{listing.location} • {listing.mileage.toLocaleString()} mi • ${listing.price.toLocaleString()}</p>
        {authMessage ? <p className="mt-2 text-sm text-slate-700">{authMessage}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">AI Deal Score</h3>
          {dealScore ? (
            <div className="space-y-2">
              <p className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${dealClass}`}>{dealScore.label} ({dealScore.score}/99)</p>
              <p className="text-sm text-slate-700">Fair range: ${dealScore.estimatedFairRange.min.toLocaleString()} - ${dealScore.estimatedFairRange.max.toLocaleString()}</p>
              <p className="text-sm text-slate-700">Confidence: {Math.round(dealScore.confidence * 100)}%</p>
              <p className="text-sm text-slate-600">{dealScore.explanation}</p>
            </div>
          ) : <p className="text-sm text-slate-600">No score available.</p>}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">AI Risk Check</h3>
          {risk ? (
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold">Risk Level:</span> {risk.riskLevel}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {risk.flags.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <p className="pt-1 text-sm font-medium">Questions to ask seller:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {risk.recommendedQuestions.map((q) => <li key={q}>{q}</li>)}
              </ul>
            </div>
          ) : <p className="text-sm text-slate-600">No risk profile available.</p>}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">AI Negotiation Plan</h3>
          {negotiation ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Target offer:</span> ${negotiation.targetOffer.toLocaleString()}</p>
              <p><span className="font-semibold">Walk-away price:</span> ${negotiation.walkAwayPrice.toLocaleString()}</p>
              <ul className="list-disc space-y-1 pl-5">
                {negotiation.talkingPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          ) : <p className="text-sm text-slate-600">No negotiation plan yet.</p>}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ask AI</h3>
          <div className="space-y-3">
            <input
              className="w-full"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Is this a good deal if I drive 15k miles/year?"
            />
            <button
              type="button"
              onClick={askQuestion}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white"
            >
              {qaLoading ? "Thinking..." : "Ask"}
            </button>
            {qaAnswer ? <p className="text-sm text-slate-700">{qaAnswer.answer}</p> : null}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">AI Ranked Comparable Cars</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {comparables.map((car) => (
            <div key={car.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold">{car.year} {car.make} {car.model} {car.trim || ""}</p>
              <p className="text-sm text-slate-700">${car.price.toLocaleString()} • {car.mileage.toLocaleString()} mi</p>
              <p className="text-sm text-slate-600">{car.distanceMiles} mi away • {car.source} • relevance {car.relevance}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Saved Compare Garage</h3>
        <ComparisonTable items={saved} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Analysis History</h3>
        {!user ? (
          <p className="text-sm text-slate-600">Sign in to store and view your analysis history.</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-600">No analysis history yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {history.slice(0, 6).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium">{entry.listing.year} {entry.listing.make} {entry.listing.model} - ${entry.listing.price.toLocaleString()}</p>
                <p className="text-slate-600">{new Date(entry.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
