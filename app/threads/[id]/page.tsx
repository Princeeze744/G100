import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ThreadClient from "./ThreadClient";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await sb
      .from("posts")
      .select("body, image_urls, video_url, author:profiles!posts_author_id_fkey(full_name, role_title)")
      .eq("id", id)
      .single();

    if (!data) return { title: "G100 - Threads" };

    const author = (data as any).author;
    const name = author?.full_name || "G100 Member";
    const body = (data.body || "").trim();
    const title = body ? name + " on G100" : name + " shared a moment on G100";
    const description = body ? body.slice(0, 180) : "Vision. Leadership. Unity. - A Group of Visionary Leaders.";
    const img = (data.image_urls || [])[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        siteName: "G100",
        images: img ? [{ url: img, width: 1200, height: 630 }] : undefined,
      },
      twitter: {
        card: img ? "summary_large_image" : "summary",
        title,
        description,
        images: img ? [img] : undefined,
      },
    };
  } catch {
    return { title: "G100 - Threads" };
  }
}

export default function Page() {
  return <ThreadClient />;
}
