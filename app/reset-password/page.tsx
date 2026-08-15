"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AuthShell from "../components/AuthShell";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3.5 " +
  "text-[var(--bone)] outline-none placeholder:text-neutral-500 " +
  "focus:border-[var(--eye)]";

const btnCls =
  "w-full rounded-xl bg-[var(--bone)] px-4 py-3.5 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:bg-[var(--eye)] disabled:opacity-50";

export default function ResetPassword() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setValid(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setValid(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit() {
    setErr("");
    if (pw.length < 6) { setErr("Password needs at least 6 characters."); return; }
    if (pw !== pw2) { setErr("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOk(true);
    setTimeout(() => router.push("/threads"), 1600);
  }

  if (valid === false) {
    return (
      <AuthShell headline="Link expired" sub="This reset link is no longer valid.">
        <a href="/forgot-password" className={btnCls + " block text-center"}>
          Request a new link
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell headline="Set a new password" sub="Choose something you will remember.">
      {ok ? (
        <p className="rounded-xl border border-[var(--surf)]/30 bg-[var(--surf)]/10 p-4 text-sm text-neutral-200">
          Password updated. Taking you in...
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            className={inputCls}
            type="password"
            placeholder="New password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <input
            className={inputCls}
            type="password"
            placeholder="Confirm new password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {err && <p className="text-sm text-[var(--ember)]">{err}</p>}
          <button className={btnCls} onClick={submit} disabled={busy}>
            {busy ? "Updating..." : "Update password"}
          </button>
        </div>
      )}
    </AuthShell>
  );
}
