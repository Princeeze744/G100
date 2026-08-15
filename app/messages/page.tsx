"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, EASE, timeAgo, initials } from "../../lib/social";

type Row = {
  id: string;
  other: any;
  last_message: string;
  last_at: string;
  unread: number;
};

export default function MessagesPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>(typeof window !== "undefined" && (window as any).__g100dm ? (window as any).__g100dm : []);
  const [ready, setReady] = useState(typeof window !== "undefined" && !!(window as any).__g100dm);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<any[]>([]);

  const load = useCallback(async (myId: string) => {
    const { data: convos } = await supabase
      .from("conversations")
      .select("id, user_a, user_b, last_message, last_at")
      .or("user_a.eq." + myId + ",user_b.eq." + myId)
      .order("last_at", { ascending: false });

    const list = convos || [];
    const otherIds = list.map((c: any) => (c.user_a === myId ? c.user_b : c.user_a));
    const profs: Record<string, any> = {};
    if (otherIds.length) {
      const { data: ps } = await supabase
        .from("profiles")
        .select("id, full_name, photo_url, accent, role_title")
        .in("id", otherIds);
      for (const p of ps || []) profs[p.id] = p;
    }

    const ids = list.map((c: any) => c.id);
    const unreadBy: Record<string, number> = {};
    if (ids.length) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, sender_id, read")
        .in("conversation_id", ids)
        .eq("read", false);
      for (const m of msgs || []) {
        if (m.sender_id !== myId) unreadBy[m.conversation_id] = (unreadBy[m.conversation_id] || 0) + 1;
      }
    }

    const out = (list.map((c: any) => ({
      id: c.id,
      other: profs[c.user_a === myId ? c.user_b : c.user_a],
      last_message: c.last_message,
      last_at: c.last_at,
      unread: unreadBy[c.id] || 0,
    })));
    (window as any).__g100dm = out;
    setRows(out);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUid(data.user.id);
      await load(data.user.id);
      const { data: ps } = await supabase
        .from("profiles")
        .select("id, full_name, photo_url, accent, role_title")
        .eq("approved", true)
        .neq("id", data.user.id);
      setPeople(ps || []);
      setReady(true);
    });
  }, [router, load]);

  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel("dm-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load]);

  async function startChat(otherId: string) {
    if (!uid) return;
    const [a, b] = [uid, otherId].sort();
    const { data: existing } = await supabase
      .from("conversations").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
    if (existing?.id) { router.push("/messages/" + existing.id); return; }
    const { data: made } = await supabase
      .from("conversations").insert({ user_a: a, user_b: b }).select("id").single();
    if (made?.id) router.push("/messages/" + made.id);
  }

  const filtered = search.trim() ? people.filter((p) => (p.full_name || "").toLowerCase().includes(search.toLowerCase())) : people;

  if (!ready) {
    return (
      <main className="mx-auto max-w-xl px-4 pb-28 pt-24 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Messages</h1>
        {[0, 1, 2].map((i) => <div key={i} className="mb-3 h-16 animate-pulse rounded-2xl bg-white/5" />)}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-24 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Messages</h1>
      <p className="mb-5 text-sm text-neutral-400">Private conversations within G100.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members to message..."
        className="mb-5 w-full rounded-full border border-white/15 bg-black/30 px-4 py-3 text-[var(--bone)] outline-none placeholder:text-neutral-500 focus:border-[var(--eye)]"
      />

      {filtered.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">All Members ({filtered.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {filtered.map((p) => (
              <button key={p.id} onClick={() => startChat(p.id)} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: ACCENTS[p.accent || "eye"] + "aa" }}>
                {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : (
                  <span className="flex h-full w-full items-center justify-center bg-white/[0.06] text-xs text-neutral-300">{initials(p.full_name)}</span>
                )}
              </span>
              <span className="w-full truncate text-center text-[0.62rem] text-neutral-300">{(p.full_name || "Member").split(" ")[0]}</span>
            </button>
          ))}
        </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const a = ACCENTS[r.other?.accent || "eye"];
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: EASE }}>
              <Link href={"/messages/" + r.id} className="flex items-center gap-3 rounded-2xl border p-4 transition hover:bg-white/[0.05]" style={{ borderColor: r.unread ? a + "44" : "rgba(255,255,255,0.07)", background: r.unread ? a + "0d" : "rgba(255,255,255,0.02)" }}>
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: a + "aa" }}>
                  {r.other?.photo_url ? <img src={r.other.photo_url} alt="" className="h-full w-full object-cover" /> : (
                    <span className="flex h-full w-full items-center justify-center bg-white/[0.06] text-sm text-neutral-300">{initials(r.other?.full_name)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{r.other?.full_name || "Member"}</span>
                    <span className="ml-auto shrink-0 text-xs text-neutral-500">{timeAgo(r.last_at)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs" style={{ color: r.unread ? "var(--bone)" : "var(--smoke)" }}>
                      {r.last_message || "Say hello"}
                    </span>
                    {r.unread > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[0.6rem] font-bold text-[var(--ink)]" style={{ background: a }}>
                        {r.unread}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
        {rows.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">No conversations yet. Search a member above to start one.</p>}
      </div>
    </main>
  );
}


