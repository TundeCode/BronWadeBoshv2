import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const Input = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const { email, password } = Input.parse(await req.json());
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }

  const user = await createUser({
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  });

  const res = NextResponse.json({ user: { id: user.id, email: user.email } });
  setSessionCookie(res, { id: user.id, email: user.email });
  return res;
}
