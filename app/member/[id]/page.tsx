import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import MemberClient from "./MemberClient";

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
      .from("profiles")
      .select("full_name, role_title, city, bio, photo_url")
      .eq("id", id)
      .single();

    if (!data) return { title: "G100 - Member" };

    const title = (data.full_name || "G100 Member") + " - G100";
    const description = (data.bio || "").trim().slice(0, 180) ||
      [data.role_title, data.city].filter(Boolean).join(" - ") ||
      "One of the Hundred. Vision. Leadership. Unity.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        siteName: "G100",
        images: data.photo_url ? [{ url: data.photo_url, width: 1200, height: 630 }] : undefined,
      },
      twitter: {
        card: data.photo_url ? "summary_large_image" : "summary",
        title,
        description,
        images: data.photo_url ? [data.photo_url] : undefined,
      },
    };
  } catch {
    return { title: "G100 - Member" };
  }
}

export default function Page() {
  return <MemberClient />;
}
