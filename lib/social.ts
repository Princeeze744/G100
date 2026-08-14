// Shared social helpers for G100 Threads
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
};
