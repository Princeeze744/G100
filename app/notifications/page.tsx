"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, EASE, timeAgo } from "../../lib/social";
import { Avatar } from "../components/SocialUI";

const LABEL: Record<string, string> = {
  like: "liked your post",
  comment: "replied to your post",
  repost: "reposted your post",
  quote: "quoted your post",
  mention: "mentioned you",
  comment_like: "liked your reply",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (myId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("id, type, post_id, read, created_at, actor:profiles!notifications_actor_id_fkey(full_name, photo_url, accent)")
      .eq("user_id", myId)
      .order("created_at", { ascending: false })
      .limit(60);
    setRows(data || []);
    await supabase.from("notifications").update({ read: true }).eq("user_id", myId).eq("read", false);
    window.dispatchEvent(new Event("g100-notifs-read"));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUid(data.user.id);
      await load(data.user.id);
      setReady(true);
    });
  }, [router, load]);

  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel("notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: "user_id=eq." + uid }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-xl px-4 pb-28 pt-24 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-24 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Notifications</h1>
      <p className="mb-6 text-sm text-neutral-400">What the flock has been doing.</p>

      <div className="flex flex-col gap-2">
        {rows.map((n, i) => {
          const a = ACCENTS[n.actor?.accent || "eye"];
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3), ease: EASE }}
              className="flex items-center gap-3 rounded-2xl border p-4 transition hover:bg-white/[0.05]"
              style={{ borderColor: n.read ? "rgba(255,255,255,0.07)" : a + "44", background: n.read ? "rgba(255,255,255,0.02)" : a + "0f" }}
            >
              <Avatar url={n.actor?.photo_url} name={n.actor?.full_name} accent={a} size={40} />
              <p className="flex-1 text-sm text-neutral-200">
                <span className="font-semibold">{n.actor?.full_name || "Someone"}</span>{" "}
                <span className="text-neutral-400">{LABEL[n.type] || "interacted"}</span>
              </p>
              <span className="shrink-0 text-xs text-neutral-500">{timeAgo(n.created_at)}</span>
            </motion.div>
          );
          return n.post_id ? (
            <Link key={n.id} href={"/threads/" + n.post_id}>{inner}</Link>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
        {rows.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">Nothing yet. Go make some noise.</p>}
      </div>
    </main>
  );
}

