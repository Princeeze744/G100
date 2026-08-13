"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import AuthShell from "../components/AuthShell";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 " +
  "px-4 py-3.5 text-sm text-[var(--bone)] outline-none transition " +
  "placeholder:text-neutral-400 focus:border-[var(--eye)] " +
  "focus:shadow-[0_0_20px_rgba(232,163,61,0.15)]";

const btnCls =
  "group relative w-full overflow-hidden rounded-xl " +
  "bg-[var(--bone)] px-4 py-3.5 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:bg-[var(--eye)] " +
  "disabled:opacity-50";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setErr("");
    if (!name.trim()) {
      setErr("Tell us your name, eagle.");
      return;
    }
    if (password.length < 6) {
      setErr("Password needs at least 6 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
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
      headline="Join the formation"
      sub="Create your account. An admin approves you before you appear in The 100."
    >
      <div className="flex flex-col gap-3">
        <input
          className={inputCls}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        {err && <p className="text-sm text-[var(--ember)]">{err}</p>}
        <button className={btnCls} onClick={onSubmit} disabled={busy}>
          {busy ? "Spreading wings..." : "Create account"}
        </button>
      </div>

      <p className="mt-6 text-sm text-neutral-400">
        Already one of us?{" "}
        <Link href="/login" className="text-[var(--eye)]">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}



