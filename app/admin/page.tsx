"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import GalleryManager from "../components/GalleryManager";

type Row = {
  id: string;
  full_name: string;
  role_title: string;
  city: string;
  photo_url: string;
  accent: string;
  approved: boolean;
  created_at: string;
};

const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};

const cardCls =
  "flex items-center gap-4 rounded-2xl border border-white/10 " +
  "bg-white/[0.03] p-4";

const approveCls =
  "rounded-full bg-[var(--eye)] px-5 py-2 text-xs font-semibold " +
  "text-[var(--ink)] transition hover:opacity-85";

const revokeCls =
  "rounded-full border border-white/20 px-5 py-2 text-xs " +
  "text-neutral-300 transition hover:border-[var(--ember)] " +
  "hover:text-[var(--ember)]";

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role_title, city, photo_url, accent, approved, created_at"
      )
      .order("created_at", { ascending: false });
    setRows((data || []) as Row[]);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      const { data: me } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();
      if (!me?.is_admin) {
        router.push("/");
        return;
      }
      setReady(true);
      load();
    });
  }, [router]);

  async function setApproved(id: string, value: boolean) {
    await supabase
      .from("profiles")
      .update({ approved: value })
      .eq("id", id);
    load();
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">Checking wings...</p>
      </main>
    );
  }

  const pending = rows.filter((r) => !r.approved);
  const approved = rows.filter((r) => r.approved);

  function MemberRow({ r }: { r: Row }) {
    const accent = ACCENTS[r.accent] || ACCENTS.eye;
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cardCls}
      >
        <div
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border"
          style={{ borderColor: accent + "88" }}
        >
          {r.photo_url ? (
            <Image
              src={r.photo_url}
              alt={r.full_name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.05] text-xs text-neutral-400">
              {(r.full_name || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {r.full_name || "Unnamed"}
          </p>
          <p className="truncate text-xs text-neutral-400">
            {r.role_title || "No role yet"}
            {r.city ? " - " + r.city : ""}
          </p>
        </div>

        {r.approved ? (
          <button
            className={revokeCls}
            onClick={() => setApproved(r.id, false)}
          >
            Revoke
          </button>
        ) : (
          <button
            className={approveCls}
            onClick={() => setApproved(r.id, true)}
          >
            Approve
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-28">
      <h1 className="mb-2 text-3xl font-bold">The Gate</h1>
      <p className="mb-10 text-sm text-neutral-400">
        You decide who joins the formation.
      </p>

      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
        Pending ({pending.length})
      </h2>
      <div className="mb-12 flex flex-col gap-3">
        {pending.length === 0 && (
          <p className="text-sm text-neutral-400">
            No one at the gate. The nest is calm.
          </p>
        )}
        {pending.map((r) => (
          <MemberRow key={r.id} r={r} />
        ))}
      </div>

      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
        The 100 ({approved.length})
      </h2>
      <div className="flex flex-col gap-3">
        {approved.map((r) => (
          <MemberRow key={r.id} r={r} />
        ))}
      </div>

      <GalleryManager />
    </main>
  );
}



