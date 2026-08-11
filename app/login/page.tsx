"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import AuthShell from "../components/AuthShell";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 " +
  "px-4 py-3.5 text-sm text-[var(--bone)] outline-none transition " +
  "placeholder:text-neutral-500 focus:border-[var(--eye)] " +
  "focus:shadow-[0_0_20px_rgba(232,163,61,0.15)]";

const btnCls =
  "w-full rounded-xl bg-[var(--bone)] px-4 py-3.5 text-sm " +
  "font-semibold text-[var(--ink)] transition " +
  "hover:bg-[var(--eye)] disabled:opacity-50";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/profile");
  }

  return (
    <AuthShell
      headline="Welcome back"
      sub="The formation missed you."
    >
      <div className="flex flex-col gap-3">
        <input
          className={inputCls}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={inputCls}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        {err && <p className="text-sm text-[var(--ember)]">{err}</p>}
        <button className={btnCls} onClick={onSubmit} disabled={busy}>
          {busy ? "Opening the gates..." : "Log in"}
        </button>
      </div>

      <p className="mt-6 text-sm text-neutral-400">
        New to the family?{" "}
        <Link href="/join" className="text-[var(--eye)]">
          Join G100
        </Link>
      </p>
    </AuthShell>
  );
}

