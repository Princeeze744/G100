"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";

const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};
const ease = [0.25, 0.1, 0.25, 1] as const;

type Author = {
  full_name: string;
  photo_url: string;
  accent: string;
  role_title: string;
};
type Post = {
  id: string;
  author_id: string;
  body: string;
  image_url: string;
  created_at: string;
  author: Author | null;
  likes: number;
  liked: boolean;
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}
function initials(n: string) {
  return n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ url, name, accent, size }: { url?: string; name?: string; accent: string; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border"
      style={{ width: size, height: size, borderColor: accent + "88" }}
    >
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-neutral-300" style={{ fontSize: size * 0.32 }}>
          {initials(name || "G")}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [me, setMe] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState("");
  const [posting, setPosting] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async (myId: string | null) => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, author_id, body, image_url, created_at, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      setErr(error.message);
      return;
    }
    const rows = (data || []) as any[];
    const ids = rows.map((r) => r.id);
    const likesByPost: Record<string, number> = {};
    const likedSet = new Set<string>();
    if (ids.length) {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", ids);
      for (const l of likes || []) {
        likesByPost[l.post_id] = (likesByPost[l.post_id] || 0) + 1;
        if (myId && l.user_id === myId) likedSet.add(l.post_id);
      }
    }
    setPosts(
      rows.map((r) => ({
        ...r,
        author: r.author,
        likes: likesByPost[r.id] || 0,
        liked: likedSet.has(r.id),
      }))
    );
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUid(data.user.id);
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, photo_url, accent, role_title, approved")
        .eq("id", data.user.id)
        .single();
      if (!prof?.approved) {
        router.push("/profile");
        return;
      }
      setMe(prof as Author);
      await load(data.user.id);
      setReady(true);
    });
  }, [router, load]);

  useEffect(() => {
    if (!uid) return;
    const ch = supabase
      .channel("feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => load(uid))
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [uid, load]);

  function pickImage(f: File) {
    setImg(f);
    setImgPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!uid || (!body.trim() && !img)) return;
    setPosting(true);
    setErr("");
    let image_url = "";
    if (img) {
      const small = await shrinkImage(img, 1400);
      const path = uid + "/" + Date.now() + ".jpg";
      const { error: upErr } = await supabase.storage
        .from("posts")
        .upload(path, small, { contentType: "image/jpeg" });
      if (upErr) {
        setErr("Image upload failed: " + upErr.message);
        setPosting(false);
        return;
      }
      image_url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase
      .from("posts")
      .insert({ author_id: uid, body: body.trim(), image_url });
    if (error) {
      setErr("Post failed: " + error.message);
      setPosting(false);
      return;
    }
    setBody("");
    setImg(null);
    setImgPreview("");
    setPosting(false);
    await load(uid);
  }

  async function like(p: Post) {
    if (!uid) return;
    setPosts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x
      )
    );
    if (p.liked) {
      await supabase.from("post_likes").delete().eq("post_id", p.id).eq("user_id", uid);
    } else {
      await supabase.from("post_likes").insert({ post_id: p.id, user_id: uid });
    }
  }

  async function del(p: Post) {
    await supabase.from("posts").delete().eq("id", p.id);
    load(uid);
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">Loading the feed...</p>
      </main>
    );
  }

  const myAccent = ACCENTS[me?.accent || "eye"];

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">The Feed</h1>
        <p className="text-sm text-neutral-400">Share your thoughts with G100.</p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex gap-3">
          <Avatar url={me?.photo_url} name={me?.full_name} accent={myAccent} size={40} />
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[60px] w-full resize-none bg-transparent text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500"
            />
            {imgPreview && (
              <div className="relative mt-2 overflow-hidden rounded-2xl">
                <img src={imgPreview} alt="" className="max-h-72 w-full object-cover" />
                <button
                  onClick={() => { setImg(null); setImgPreview(""); }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="Remove image"
                >
                  x
                </button>
              </div>
            )}
            {err && <p className="mt-2 text-xs text-[var(--ember)]">{err}</p>}
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => fileRef.current?.click()} className="text-xs text-neutral-400 transition hover:text-[var(--eye)]">
                + Photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImage(f); }}
              />
              <button
                onClick={submit}
                disabled={posting || (!body.trim() && !img)}
                className="rounded-full px-5 py-2 text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40"
                style={{ background: myAccent }}
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {posts.map((p) => {
            const a = ACCENTS[p.author?.accent || "eye"];
            const hot = p.likes >= 3;
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease }}
                className="relative overflow-hidden rounded-3xl border bg-white/[0.03] p-5"
                style={{
                  borderColor: hot ? a + "66" : "rgba(255,255,255,0.08)",
                  boxShadow: hot ? "0 0 30px " + a + "22" : "none",
                }}
              >
                <div className="absolute left-0 top-0 h-full w-1" style={{ background: a, opacity: hot ? 0.9 : 0.4 }} />
                <div className="flex items-center gap-3">
                  <Avatar url={p.author?.photo_url} name={p.author?.full_name} accent={a} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.author?.full_name || "G100 Member"}</p>
                    <p className="truncate text-xs text-neutral-400">
                      {p.author?.role_title || "Visionary Leader"} · {timeAgo(p.created_at)}
                    </p>
                  </div>
                  {p.author_id === uid && (
                    <button onClick={() => del(p)} className="text-xs text-neutral-500 transition hover:text-[var(--ember)]" aria-label="Delete">
                      Delete
                    </button>
                  )}
                </div>
                {p.body && <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-neutral-100">{p.body}</p>}
                {p.image_url && (
                  <div className="mt-3 overflow-hidden rounded-2xl">
                    <img src={p.image_url} alt="" className="w-full object-cover" />
                  </div>
                )}
                <div className="mt-4 flex items-center gap-5">
                  <button onClick={() => like(p)} className="flex items-center gap-1.5 text-sm" style={{ color: p.liked ? a : "var(--bone)" }}>
                    <span className="text-base">{p.liked ? "♥" : "♡"}</span>
                    <span className="tabular-nums">{p.likes}</span>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {posts.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">No posts yet. Be the first to share.</p>
        )}
      </div>
    </main>
  );
}


