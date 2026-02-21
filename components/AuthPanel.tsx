"use client";

import { useEffect, useState } from "react";
import { UserPublic } from "@/lib/types";

export function AuthPanel() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    void refreshMe();
  }, []);

  const refreshMe = async () => {
    const res = await fetch("/api/auth/me");
    const data = (await res.json()) as { user: UserPublic | null };
    setUser(data.user);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = (await res.json()) as { user?: UserPublic; error?: string };
    if (!res.ok) {
      setMessage(data.error || "Request failed.");
      return;
    }

    setUser(data.user || null);
    setPassword("");
    setMessage(mode === "login" ? "Logged in." : "Account created.");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMessage("Logged out.");
  };

  if (user) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <p className="text-sm text-slate-700">Signed in as <span className="font-semibold">{user.email}</span></p>
        <button type="button" onClick={logout} className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white">Log out</button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-1 text-sm ${mode === "login" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg px-3 py-1 text-sm ${mode === "register" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" minLength={8} required />
        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="submit">
          {mode === "login" ? "Login" : "Sign up"}
        </button>
      </form>

      {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
