// Shared social helpers for G100 Threads
import { supabase } from "./supabaseClient";

export const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};

export const EASE = [0.25, 0.1, 0.25, 1] as const;

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function initials(n?: string) {
  return (n || "G").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export type Author = {
  id?: string;
  full_name: string;
  photo_url: string;
  accent: string;
  role_title: string;
};

export type Post = {
  id: string;
  author_id: string;
  body: string;
  image_urls: string[];
  created_at: string;
  repost_of: string | null;
  is_quote: boolean;
  author: Author | null;
  original?: Post | null;
  likes: number;
  liked: boolean;
  comments: number;
  reposts: number;
  reposted: boolean;
  bookmarked?: boolean;
};

// Create a notification (never notify yourself)
export async function notify(opts: {
  userId?: string | null;
  actorId: string;
  type: "like" | "comment" | "repost" | "quote" | "mention" | "comment_like";
  postId?: string | null;
  commentId?: string | null;
}) {
  if (!opts.userId || opts.userId === opts.actorId) return;
  await supabase.from("notifications").insert({
    user_id: opts.userId,
    actor_id: opts.actorId,
    type: opts.type,
    post_id: opts.postId || null,
    comment_id: opts.commentId || null,
  });
}

// Find @mentions in text and notify those members
export async function notifyMentions(body: string, actorId: string, postId: string) {
  const handles = Array.from(new Set((body.match(/@([\w.]+)/g) || []).map((h) => h.slice(1).toLowerCase())));
  if (handles.length === 0) return;
  const { data } = await supabase.from("profiles").select("id, full_name").eq("approved", true);
  for (const p of data || []) {
    const slug = (p.full_name || "").toLowerCase().replace(/\s+/g, "");
    if (handles.some((h) => slug.startsWith(h) || h === slug)) {
      await notify({ userId: p.id, actorId, type: "mention", postId });
    }
  }
}

// Render @mentions as highlighted text
export function renderBody(body: string) {
  return body;
}
