"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import EketCountdown from "../components/EketCountdown";

const EVENT = "eket-2026";
const ease = [0.25, 0.1, 0.25, 1] as const;

type Face = {
  id: string;
  name: string;
  photo: string;
  accent: string;
};

const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};

const rsvpBtn =
  "rounded-full bg-[var(--eye)] px-8 py-3.5 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:opacity-85 disabled:opacity-50";

const cancelBtn =
  "rounded-full border border-white/20 px-8 py-3.5 text-sm " +
  "text-neutral-300 transition hover:border-[var(--ember)] " +
  "hover:text-[var(--ember)]";

const detailCls =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6";

export default function EketPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [going, setGoing] = useState(false);
  const [faces, setFaces] = useState<Face[]>([]);
  const [busy, setBusy] = useState(false);

  async function load(uid: string | null) {
    const { data } = await supabase
      .from("event_rsvps")
      .select("user_id, profiles(id, full_name, photo_url, accent)")
      .eq("event_slug", EVENT);

    const list: Face[] = [];
    let me = false;
    for (const r of data || []) {
      const pr = r.profiles as any;
      if (!pr) continue;
      if (uid && r.user_id === uid) me = true;
      list.push({
        id: pr.id,
        name: pr.full_name || "G100 Member",
        photo: pr.photo_url || "",
        accent: pr.accent || "eye",
      });
    }
    setFaces(list);
    setGoing(me);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setUserId(uid);
      load(uid);
    });
  }, []);

  async function toggle() {
    if (!userId) return;
    setBusy(true);
    if (going) {
      await supabase
        .from("event_rsvps")
        .delete()
        .eq("user_id", userId)
        .eq("event_slug", EVENT);
    } else {
      await supabase
        .from("event_rsvps")
        .insert({ user_id: userId, event_slug: EVENT });
    }
    await load(userId);
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
          Next Flight
        </p>
        <h1 className="mb-3 text-4xl font-bold sm:text-5xl">
          Eket Beach Day
        </h1>
        <p className="mb-10 max-w-xl text-neutral-300">
          The formation lands on the sand. One day of sun, surf, food,
          games and one hundred leaders catching fun together.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease }}
      >
        <EketCountdown />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease }}
        className="mt-10 grid gap-4 sm:grid-cols-3"
      >
        <div className={detailCls}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Date
          </p>
          <p className="font-semibold">Friday, Aug 21</p>
          <p className="text-sm text-neutral-400">From 9:00 AM</p>
        </div>
        <div className={detailCls}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Location
          </p>
          <p className="font-semibold">Eket Beach</p>
          <p className="text-sm text-neutral-400">Akwa Ibom State</p>
        </div>
        <div className={detailCls}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Bring
          </p>
          <p className="font-semibold">Your energy</p>
          <p className="text-sm text-neutral-400">
            Beach fit, shades, good vibes
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease }}
        className="mt-14"
      >
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
          The Landing Party ({faces.length})
        </h2>
        <p className="mb-6 text-sm text-neutral-400">
          Members already confirmed for the sand.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          {faces.length === 0 && (
            <p className="text-sm text-neutral-400">
              Be the first eagle on the beach.
            </p>
          )}
          {faces.map((f) => {
            const a = ACCENTS[f.accent] || ACCENTS.eye;
            return (
              <div key={f.id} className="group relative" title={f.name}>
                <div
                  className="relative h-14 w-14 overflow-hidden rounded-full border-2"
                  style={{ borderColor: a }}
                >
                  {f.photo ? (
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.05] text-xs text-neutral-400">
                      {f.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {userId ? (
          <button className={going ? cancelBtn : rsvpBtn} onClick={toggle} disabled={busy}>
            {busy
              ? "..."
              : going
              ? "Cancel my spot"
              : "I will be there"}
          </button>
        ) : (
          <Link href="/join" className={rsvpBtn + " inline-block"}>
            Join G100 to RSVP
          </Link>
        )}
      </motion.div>
    </main>
  );
}

