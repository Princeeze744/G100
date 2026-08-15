"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import AuthShell from "../components/AuthShell";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3.5 " +
  "text-[var(--bone)] outline-none placeholder:text-neutral-500 " +
  "focus:border-[var(--eye)]";

const btnCls =
  "w-full rounded-xl bg-[var(--bone)] px-4 py-3.5 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:bg-[var(--eye)] disabled:opacity-50";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!email.trim()) return;
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  }

  return (
    <AuthShell
      headline="Forgot your password?"
      sub="Enter your email and we will send you a reset link."
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl border border-[var(--surf)]/30 bg-[var(--surf)]/10 p-4 text-sm text-neutral-200">
            Check your inbox. If an account exists for that email, a reset
            link is on its way. It may take a minute, and check spam.
          </p>
          <Link href="/login" className="text-sm text-[var(--eye)]">
            Back to log in
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            className={inputCls}
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {err && <p className="text-sm text-[var(--ember)]">{err}</p>}
          <button className={btnCls} onClick={submit} disabled={busy}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
          <Link href="/login" className="mt-2 text-sm text-neutral-400">
            Back to log in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
