import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

const Input = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  const { email, password } = Input.parse(await req.json());
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ user: { id: user.id, email: user.email } });
  setSessionCookie(res, { id: user.id, email: user.email });
  return res;
}
