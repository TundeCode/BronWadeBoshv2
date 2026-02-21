import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserById } from "@/lib/db";
import { UserPublic } from "@/lib/types";

const SESSION_COOKIE = "bronwade_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

type SessionPayload = {
  uid: string;
  email: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || "dev-only-secret-change-me";
}

function sign(input: string) {
  return crypto.createHmac("sha256", getSecret()).update(input).digest("hex");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(body);
  return `${body}.${sig}`;
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

export function setSessionCookie(res: NextResponse, user: UserPublic) {
  const token = encode({
    uid: user.id,
    email: user.email,
    exp: Date.now() + SESSION_MAX_AGE * 1000
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/"
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decode(token);
  if (!payload) return null;

  const user = await findUserById(payload.uid);
  if (!user) return null;

  return { id: user.id, email: user.email };
}
