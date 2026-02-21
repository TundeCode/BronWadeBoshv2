export type SellerType = "dealer" | "private" | "marketplace";

export type VehicleListing = {
  id: string;
  sourceUrl?: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  price: number;
  location: string;
  vin?: string;
  sellerType: SellerType;
  conditionNotes?: string;
};

export type DealScore = {
  label: "Great Deal" | "Fair" | "Overpriced";
  score: number;
  estimatedFairRange: { min: number; max: number };
  confidence: number;
  explanation: string;
};

export type RiskAssessment = {
  riskLevel: "Low" | "Medium" | "High";
  flags: string[];
  recommendedQuestions: string[];
};

export type ComparableCar = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  distanceMiles: number;
  source: string;
  relevance: number;
};

export type NegotiationPlan = {
  targetOffer: number;
  walkAwayPrice: number;
  talkingPoints: string[];
};

export type QaResponse = {
  answer: string;
};

export type UserPublic = {
  id: string;
  email: string;
};

export type SavedListing = {
  id: string;
  userId: string;
  listing: VehicleListing;
  savedAt: string;
};

export type AnalysisHistoryEntry = {
  id: string;
  userId: string;
  createdAt: string;
  listing: VehicleListing;
  dealScore: DealScore | null;
  risk: RiskAssessment | null;
};
