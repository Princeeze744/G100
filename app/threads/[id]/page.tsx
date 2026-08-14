"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { ACCENTS, timeAgo, Post } from "../../../lib/social";
import { PostCard, Avatar } from "../../components/SocialUI";

const SELECT = "id, author_id, body, image_urls, created_at, repost_of, is_quote, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)";

export default function ThreadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (myId: string | null) => {
    const { data: p } = await supabase.from("posts").select(SELECT).eq("id", id).single();
    if (!p) { setReady(true); return; }

    let original = null;
    if (p.repost_of) {
      const { data: o } = await supabase.from("posts").select(SELECT).eq("id", p.repost_of).single();
      original = o ? { ...o, image_urls: o.image_urls || [] } : null;
    }

    const [{ data: likes }, { data: cms }, { data: rps }] = await Promise.all([
      supabase.from("post_likes").select("post_id, user_id").eq("post_id", id),
      supabase.from("post_comments").select("id, body, created_at, author_id, parent_id, author:profiles!post_comments_author_id_fkey(full_name, photo_url, accent)").eq("post_id", id).order("created_at", { ascending: true }),
      supabase.from("posts").select("author_id, is_quote").eq("repost_of", id),
    ]);

    const cIds = (cms || []).map((c: any) => c.id);
    const clCount: Record<string, number> = {};
    const clMine = new Set<string>();
    if (cIds.length) {
      const { data: cl } = await supabase.from("comment_likes").select("comment_id, user_id").in("comment_id", cIds);
      for (const l of cl || []) {
        clCount[l.comment_id] = (clCount[l.comment_id] || 0) + 1;
        if (myId && l.user_id === myId) clMine.add(l.comment_id);
      }
    }

    setPost({
      ...(p as any),
      image_urls: p.image_urls || [],
      original,
      likes: (likes || []).length,
      liked: !!(myId && (likes || []).some((l: any) => l.user_id === myId)),
      comments: (cms || []).length,
      reposts: (rps || []).length,
      reposted: !!(myId && (rps || []).some((r: any) => r.author_id === myId && !r.is_quote)),
    } as Post);

    setComments((cms || []).map((c: any) => ({ ...c, likes: clCount[c.id] || 0, liked: clMine.has(c.id) })));
    setReady(true);
  }, [id]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const myId = data.user?.id || null;
      setUid(myId);
      if (myId) {
        const { data: prof } = await supabase.from("profiles").select("approved").eq("id", myId).single();
        setApproved(!!prof?.approved);
      }
      await load(myId);
    });
  }, [load]);

  useEffect(() => {
    const ch = supabase.channel("thread-" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments", filter: "post_id=eq." + id }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, uid, load]);

  async function send() {
    if (!uid || !text.trim()) return;
    await supabase.from("post_comments").insert({ post_id: id, author_id: uid, body: text.trim(), parent_id: replyTo?.id || null });
    setText(""); setReplyTo(null);
    load(uid);
  }

  async function likeComment(c: any) {
    if (!uid || !approved) return;
    setComments((prev) => prev.map((x) => x.id === c.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x));
    if (c.liked) await supabase.from("comment_likes").delete().eq("comment_id", c.id).eq("user_id", uid);
    else await supabase.from("comment_likes").insert({ comment_id: c.id, user_id: uid });
  }

  async function delComment(c: any) {
    await supabase.from("post_comments").delete().eq("id", c.id);
    load(uid);
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Loading...</p></main>;
  if (!post) return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Post not found.</p></main>;

  const tops = comments.filter((c) => !c.parent_id);
  const repliesOf = (pid: string) => comments.filter((c) => c.parent_id === pid);

  function CommentRow({ c, nested }: { c: any; nested?: boolean }) {
    const ca = ACCENTS[c.author?.accent || "eye"];
    return (
      <div className={"flex gap-2.5 " + (nested ? "ml-10" : "")}>
        <Avatar url={c.author?.photo_url} name={c.author?.full_name} accent={ca} size={nested ? 28 : 34} href={"/member/" + c.author_id} />
        <div className="flex-1">
          <div className="rounded-2xl bg-white/[0.04] px-3 py-2">
            <div className="flex items-center gap-2">
              <Link href={"/member/" + c.author_id} className="text-xs font-semibold hover:underline">{c.author?.full_name || "Member"}</Link>
              <span className="text-[0.65rem] text-neutral-500">{timeAgo(c.created_at)}</span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-200">{c.body}</p>
          </div>
          <div className="mt-1 flex items-center gap-4 pl-3">
            <button onClick={() => likeComment(c)} disabled={!approved} className="flex items-center gap-1 text-xs disabled:opacity-50" style={{ color: c.liked ? ca : "var(--smoke)" }}>
              <span>{c.liked ? "\u2665" : "\u2661"}</span>
              {c.likes > 0 && <span className="tabular-nums">{c.likes}</span>}
            </button>
            {!nested && approved && (
              <button onClick={() => setReplyTo(c)} className="text-xs text-neutral-500 transition hover:text-[var(--bone)]">Reply</button>
            )}
            {c.author_id === uid && (
              <button onClick={() => delComment(c)} className="text-xs text-neutral-600 transition hover:text-[var(--ember)]">Delete</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-32 pt-24 sm:px-6">
      <button onClick={() => router.back()} className="mb-5 text-sm text-neutral-400 transition hover:text-[var(--eye)]">{"\u2190"} Back</button>

      <PostCard p={post} uid={uid} approved={approved} onChanged={() => load(uid)} />

      <h2 className="mb-4 mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
        {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="flex flex-col gap-4">
        {tops.map((c) => (
          <div key={c.id} className="flex flex-col gap-3">
            <CommentRow c={c} />
            {repliesOf(c.id).map((r) => <CommentRow key={r.id} c={r} nested />)}
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-neutral-500">No replies yet. Start the conversation.</p>}
      </div>

      {approved ? (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2 border-t border-white/10 bg-[#0d0b09]/95 p-4 backdrop-blur-xl">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
              <span>Replying to {replyTo.author?.full_name || "Member"}</span>
              <button onClick={() => setReplyTo(null)} className="text-neutral-500 hover:text-white">cancel</button>
            </div>
          )}
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={replyTo ? "Write a reply..." : "Write a comment..."} className="flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500 focus:border-[var(--eye)]" />
            <button onClick={send} disabled={!text.trim()} className="rounded-full bg-[var(--eye)] px-5 py-2.5 text-xs font-semibold text-[var(--ink)] disabled:opacity-40">Send</button>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-neutral-500">Log in as a member to reply.</p>
      )}
    </main>
  );
}
