"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";
import { ACCENTS, EASE, initials, timeAgo } from "../../lib/social";
import { tap } from "../../lib/haptic";

type Story = {
  id: string;
  author_id: string;
  image_url: string;
  video_url?: string;
  caption?: string;
  created_at: string;
  author: any;
};

type Group = { authorId: string; author: any; items: Story[] };

const DURATION = 5000;

export default function Stories({ uid, me }: { uid: string | null; me: any }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState<{ g: number; i: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<any>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("stories")
      .select("id, author_id, image_url, video_url, caption, created_at, author:profiles!stories_author_id_fkey(full_name, photo_url, accent)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    const byAuthor: Record<string, Group> = {};
    for (const s of (data || []) as any[]) {
      if (!byAuthor[s.author_id]) byAuthor[s.author_id] = { authorId: s.author_id, author: s.author, items: [] };
      byAuthor[s.author_id].items.push(s);
    }
    const list = Object.values(byAuthor);
    list.sort((a, b) => (a.authorId === uid ? -1 : b.authorId === uid ? 1 : 0));
    setGroups(list);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel("stories")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // auto-advance
  useEffect(() => {
    if (!open) return;
    setProgress(0);
    const started = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min((Date.now() - started) / DURATION, 1);
      setProgress(p);
      if (p >= 1) next();
    }, 50);
    return () => clearInterval(timer.current);
  }, [open]);

  function next() {
    clearInterval(timer.current);
    setOpen((o) => {
      if (!o) return null;
      const g = groups[o.g];
      if (o.i + 1 < g.items.length) return { g: o.g, i: o.i + 1 };
      if (o.g + 1 < groups.length) return { g: o.g + 1, i: 0 };
      return null;
    });
  }

  function prev() {
    clearInterval(timer.current);
    setOpen((o) => {
      if (!o) return null;
      if (o.i > 0) return { g: o.g, i: o.i - 1 };
      if (o.g > 0) return { g: o.g - 1, i: 0 };
      return o;
    });
  }

  async function upload(file: File) {
    if (!uid) return;
    setUploading(true);
    tap();
    const isVideo = file.type.startsWith("video/");
    let blob: Blob = file;
    if (!isVideo) blob = await shrinkImage(file, 1400);
    const ext = isVideo ? ".mp4" : ".jpg";
    const path = uid + "/story-" + Date.now() + ext;
    const { error } = await supabase.storage.from("posts").upload(path, blob, { contentType: isVideo ? file.type : "image/jpeg" });
    if (!error) {
      const url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
      await supabase.from("stories").insert({
        author_id: uid,
        image_url: isVideo ? "" : url,
        video_url: isVideo ? url : "",
      });
      await load();
    }
    setUploading(false);
  }

  const mine = groups.find((g) => g.authorId === uid);
  const cur = open ? groups[open.g]?.items[open.i] : null;

  return (
    <>
      <div className="mb-6 flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {uid && (
          <button onClick={() => fileRef.current?.click()} className="flex shrink-0 flex-col items-center gap-1.5" aria-label="Add story">
            <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed" style={{ borderColor: ACCENTS[me?.accent || "eye"] + "88" }}>
              {me?.photo_url ? (
                <img src={me.photo_url} alt="" className="h-full w-full object-cover opacity-60" />
              ) : (
                <span className="text-xs text-neutral-400">{initials(me?.full_name)}</span>
              )}
              <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-[var(--ink)]" style={{ background: ACCENTS[me?.accent || "eye"] }}>
                {uploading ? "\u00B7\u00B7" : "+"}
              </span>
            </span>
            <span className="text-[0.65rem] text-neutral-400">Your story</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />

        {groups.map((g, gi) => {
          const a = ACCENTS[g.author?.accent || "eye"];
          if (g.authorId === uid && !g.items.length) return null;
          return (
            <button key={g.authorId} onClick={() => { tap(); setOpen({ g: gi, i: 0 }); }} className="flex shrink-0 flex-col items-center gap-1.5">
              <span className="flex h-16 w-16 items-center justify-center rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, " + a + ", var(--ember))" }}>
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#0d0b09]">
                  {g.author?.photo_url ? (
                    <img src={g.author.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-300">{initials(g.author?.full_name)}</span>
                  )}
                </span>
              </span>
              <span className="max-w-16 truncate text-[0.65rem] text-neutral-300">
                {g.authorId === uid ? "You" : (g.author?.full_name || "Member").split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && cur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black"
          >
            <div className="flex gap-1 px-3 pt-3">
              {groups[open.g].items.map((_, i) => (
                <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full bg-white" style={{ width: i < open.i ? "100%" : i === open.i ? progress * 100 + "%" : "0%" }} />
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <Link href={"/member/" + cur.author_id} className="flex items-center gap-2.5">
                <span className="h-9 w-9 overflow-hidden rounded-full border" style={{ borderColor: ACCENTS[cur.author?.accent || "eye"] }}>
                  {cur.author?.photo_url ? <img src={cur.author.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="text-sm font-semibold text-white">{cur.author?.full_name || "Member"}</span>
              </Link>
              <span className="text-xs text-white/50">{timeAgo(cur.created_at)}</span>
              {cur.author_id === uid && (
                <button onClick={async () => { await supabase.from("stories").delete().eq("id", cur.id); setOpen(null); load(); }} className="ml-auto mr-2 text-xs text-white/60">Delete</button>
              )}
              <button onClick={() => setOpen(null)} aria-label="Close" className={"flex h-10 w-10 items-center justify-center text-2xl text-white/80 " + (cur.author_id === uid ? "" : "ml-auto")}>×</button>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              {cur.video_url ? (
                <video src={cur.video_url} autoPlay playsInline controls className="max-h-full max-w-full" />
              ) : (
                <img src={cur.image_url} alt="" className="max-h-full max-w-full object-contain" />
              )}
              <button onClick={prev} className="absolute bottom-0 left-0 top-0 w-1/3" aria-label="Previous" />
              <button onClick={next} className="absolute bottom-0 right-0 top-0 w-1/3" aria-label="Next" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
