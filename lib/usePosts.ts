"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Post } from "./social";

const SELECT =
  "id, author_id, body, image_urls, created_at, repost_of, is_quote, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)";

export function usePosts(opts: { authorId?: string } = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (myId: string | null) => {
    let q = supabase.from("posts").select(SELECT).order("created_at", { ascending: false }).limit(100);
    if (opts.authorId) q = q.eq("author_id", opts.authorId);
    const { data } = await q;
    const rows = (data || []) as any[];

    // fetch originals for reposts/quotes
    const originIds = rows.map((r) => r.repost_of).filter(Boolean);
    let originsById: Record<string, any> = {};
    if (originIds.length) {
      const { data: origs } = await supabase.from("posts").select(SELECT).in("id", originIds);
      for (const o of origs || []) originsById[o.id] = o;
    }

    const ids = rows.map((r) => r.id);
    const likeCount: Record<string, number> = {};
    const likedSet = new Set<string>();
    const commentCount: Record<string, number> = {};
    const repostCount: Record<string, number> = {};
    const repostedSet = new Set<string>();

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
    }

    setPosts(
      rows.map((r) => ({
        ...r,
        image_urls: r.image_urls || [],
        original: r.repost_of ? { ...(originsById[r.repost_of] || {}), image_urls: originsById[r.repost_of]?.image_urls || [] } : null,
        likes: likeCount[r.id] || 0,
        liked: likedSet.has(r.id),
        comments: commentCount[r.id] || 0,
        reposts: repostCount[r.id] || 0,
        reposted: repostedSet.has(r.id),
      })) as Post[]
    );
  }, [opts.authorId]);

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
      .channel("social-" + (opts.authorId || "all"))
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load, opts.authorId]);

  return { posts, uid, approved, ready, refresh };
}
