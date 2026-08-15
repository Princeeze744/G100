"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Post } from "./social";

// In-memory cache so returning to a page renders instantly
const CACHE: Record<string, Post[]> = {};

const SELECT =
  "id, author_id, body, image_urls, video_url, created_at, repost_of, is_quote, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)";

export function usePosts(opts: { authorId?: string; bookmarksOnly?: boolean } = {}) {
  const key = opts.authorId || (opts.bookmarksOnly ? "bm" : "all");
  const [posts, setPosts] = useState<Post[]>(CACHE[key] || []);
  const [uid, setUid] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [ready, setReady] = useState(!!CACHE[key]);

  const load = useCallback(async (myId: string | null) => {
    let rows: any[] = [];

    if (opts.bookmarksOnly) {
      if (!myId) { setPosts([]); return; }
      const { data: bms } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", myId)
        .order("created_at", { ascending: false });
      const ids = (bms || []).map((b: any) => b.post_id);
      if (ids.length === 0) { CACHE[key] = []; setPosts([]); return; }
      const { data } = await supabase.from("posts").select(SELECT).in("id", ids);
      rows = (data || []) as any[];
      rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    } else {
      let q = supabase.from("posts").select(SELECT).order("created_at", { ascending: false }).limit(100);
      if (opts.authorId) q = q.eq("author_id", opts.authorId);
      const { data } = await q;
      rows = (data || []) as any[];
    }

    const originIds = rows.map((r) => r.repost_of).filter(Boolean);
    const originsById: Record<string, any> = {};
    if (originIds.length) {
      const { data: origs } = await supabase.from("posts").select(SELECT).in("id", originIds);
      for (const o of origs || []) originsById[o.id] = { ...o, image_urls: o.image_urls || [] };
    }

    const ids = rows.map((r) => r.id);
    const likeCount: Record<string, number> = {};
    const likedSet = new Set<string>();
    const commentCount: Record<string, number> = {};
    const repostCount: Record<string, number> = {};
    const repostedSet = new Set<string>();
    const bookmarkedSet = new Set<string>();

    if (ids.length) {
      const [{ data: likes }, { data: cms }, { data: rps }] = await Promise.all([
        supabase.from("post_likes").select("post_id, user_id").in("post_id", ids),
        supabase.from("post_comments").select("post_id").in("post_id", ids),
        supabase.from("posts").select("repost_of, author_id, is_quote").in("repost_of", ids),
      ]);
      for (const l of likes || []) {
        likeCount[l.post_id] = (likeCount[l.post_id] || 0) + 1;
        if (myId && l.user_id === myId) likedSet.add(l.post_id);
      }
      for (const c of cms || []) commentCount[c.post_id] = (commentCount[c.post_id] || 0) + 1;
      for (const r of rps || []) {
        if (!r.repost_of) continue;
        repostCount[r.repost_of] = (repostCount[r.repost_of] || 0) + 1;
        if (myId && r.author_id === myId && !r.is_quote) repostedSet.add(r.repost_of);
      }
      if (myId) {
        const { data: bms } = await supabase.from("bookmarks").select("post_id").eq("user_id", myId).in("post_id", ids);
        for (const b of bms || []) bookmarkedSet.add(b.post_id);
      }
    }

    const built = rows.map((r) => ({
      ...r,
      image_urls: r.image_urls || [],
      original: r.repost_of ? originsById[r.repost_of] || null : null,
      likes: likeCount[r.id] || 0,
      liked: likedSet.has(r.id),
      comments: commentCount[r.id] || 0,
      reposts: repostCount[r.id] || 0,
      reposted: repostedSet.has(r.id),
      bookmarked: bookmarkedSet.has(r.id),
    })) as Post[];

    CACHE[key] = built;
    setPosts(built);
  }, [opts.authorId, opts.bookmarksOnly, key]);

  const refresh = useCallback(() => load(uid), [load, uid]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const myId = data.user?.id || null;
      setUid(myId);
      if (myId) {
        const { data: prof } = await supabase.from("profiles").select("approved").eq("id", myId).single();
        setApproved(!!prof?.approved);
      }
      await load(myId);
      setReady(true);
    });
  }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("social-" + key)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load, key]);

  return { posts, uid, approved, ready, refresh };
}
