import { promises as fs } from "node:fs";
import path from "node:path";
import { AnalysisHistoryEntry, SavedListing, UserPublic } from "@/lib/types";

export type UserRecord = UserPublic & {
  passwordHash: string;
  createdAt: string;
};

type UsersFile = { users: UserRecord[] };
type GarageFile = { items: SavedListing[] };
type HistoryFile = { entries: AnalysisHistoryEntry[] };

const dataDir = path.join(process.cwd(), "data");
const usersPath = path.join(dataDir, "users.json");
const garagePath = path.join(dataDir, "garage.json");
const historyPath = path.join(dataDir, "history.json");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function listUsers(): Promise<UserRecord[]> {
  const data = await readJson<UsersFile>(usersPath, { users: [] });
  return data.users;
}

export async function createUser(user: UserRecord): Promise<UserRecord> {
  const data = await readJson<UsersFile>(usersPath, { users: [] });
  data.users.push(user);
  await writeJson(usersPath, data);
  return user;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await listUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const users = await listUsers();
  return users.find((u) => u.id === id) || null;
}

export async function listSavedListings(userId: string): Promise<SavedListing[]> {
  const data = await readJson<GarageFile>(garagePath, { items: [] });
  return data.items.filter((item) => item.userId === userId).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function saveListing(userId: string, listing: SavedListing["listing"]): Promise<SavedListing> {
  const data = await readJson<GarageFile>(garagePath, { items: [] });
  const existing = data.items.find((item) => item.userId === userId && item.listing.id === listing.id);
  if (existing) {
    existing.savedAt = new Date().toISOString();
    existing.listing = listing;
    await writeJson(garagePath, data);
    return existing;
  }

  const saved: SavedListing = {
    id: crypto.randomUUID(),
    userId,
    listing,
    savedAt: new Date().toISOString()
  };
  data.items.push(saved);
  await writeJson(garagePath, data);
  return saved;
}

export async function deleteSavedListing(userId: string, listingId: string): Promise<void> {
  const data = await readJson<GarageFile>(garagePath, { items: [] });
  data.items = data.items.filter((item) => !(item.userId === userId && item.listing.id === listingId));
  await writeJson(garagePath, data);
}

export async function addHistoryEntry(
  entry: Omit<AnalysisHistoryEntry, "id" | "createdAt">
): Promise<AnalysisHistoryEntry> {
  const data = await readJson<HistoryFile>(historyPath, { entries: [] });
  const next: AnalysisHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  data.entries.push(next);
  await writeJson(historyPath, data);
  return next;
}

export async function listHistory(userId: string): Promise<AnalysisHistoryEntry[]> {
  const data = await readJson<HistoryFile>(historyPath, { entries: [] });
  return data.entries.filter((entry) => entry.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
