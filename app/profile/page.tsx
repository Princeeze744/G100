"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const ACCENTS = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};

type AccentKey = keyof typeof ACCENTS;

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 " +
  "px-4 py-3 text-sm text-[var(--bone)] outline-none transition " +
  "placeholder:text-neutral-500 focus:border-[var(--eye)]";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase " +
  "tracking-widest text-neutral-500";

const saveCls =
  "rounded-xl bg-[var(--bone)] px-8 py-3 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:bg-[var(--eye)] " +
  "disabled:opacity-50";

type Profile = {
  full_name: string;
  role_title: string;
  city: string;
  bio: string;
  services: string;
  education: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  photo_url: string;
  accent: AccentKey;
  approved: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [p, setP] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      const { data: row } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (row) setP(row as Profile);
    });
  }, [router]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function uploadPhoto(file: File) {
    if (!userId) return;
    setUploading(true);
    setMsg("");
    const path = userId + "/avatar-" + Date.now() + ".jpg";
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      setMsg("Photo upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    set("photo_url", data.publicUrl);
    setUploading(false);
  }

  async function save() {
    if (!userId || !p) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: p.full_name,
        role_title: p.role_title,
        city: p.city,
        bio: p.bio,
        services: p.services,
        education: p.education,
        instagram: p.instagram,
        twitter: p.twitter,
        linkedin: p.linkedin,
        whatsapp: p.whatsapp,
        photo_url: p.photo_url,
        accent: p.accent,
      })
      .eq("id", userId);
    setBusy(false);
    setMsg(error ? "Save failed: " + error.message : "Profile saved.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Opening the nest...</p>
      </main>
    );
  }

  const accent = ACCENTS[p.accent] || ACCENTS.eye;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <button
            onClick={logout}
            className="text-sm text-neutral-400 transition hover:text-[var(--eye)]"
          >
            Log out
          </button>
        </div>

        {!p.approved && (
          <div className="mb-8 rounded-2xl border border-[var(--eye)]/30 bg-[var(--eye)]/10 p-4 text-sm text-neutral-200">
            Your profile is awaiting admin approval. Complete it now -
            the moment you are approved, you appear in The 100.
          </div>
        )}

        <div className="mb-10 flex items-center gap-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 transition hover:opacity-80"
            style={{ borderColor: accent }}
          >
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt="Your photo"
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                {uploading ? "..." : "Add photo"}
              </span>
            )}
          </button>
          <div>
            <p className="text-sm text-neutral-300">
              Your portrait - the face in the formation.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-sm font-semibold"
              style={{ color: accent }}
            >
              {uploading ? "Uploading..." : "Upload photo"}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPhoto(f);
            }}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={inputCls}
              value={p.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Role / Profession</label>
              <input
                className={inputCls}
                placeholder="Software Engineer"
                value={p.role_title}
                onChange={(e) => set("role_title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                placeholder="Port Harcourt"
                value={p.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Bio - your story</label>
            <textarea
              className={inputCls + " min-h-28 resize-y"}
              placeholder="Who are you? What drives you?"
              value={p.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              Services - what you offer
            </label>
            <textarea
              className={inputCls + " min-h-20 resize-y"}
              placeholder="Web development, brand design, consulting..."
              value={p.services}
              onChange={(e) => set("services", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Education</label>
            <textarea
              className={inputCls + " min-h-20 resize-y"}
              placeholder="B.Sc Computer Science, UNIPORT..."
              value={p.education}
              onChange={(e) => set("education", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Instagram</label>
              <input
                className={inputCls}
                placeholder="@username"
                value={p.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>X / Twitter</label>
              <input
                className={inputCls}
                placeholder="@username"
                value={p.twitter}
                onChange={(e) => set("twitter", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>LinkedIn</label>
              <input
                className={inputCls}
                placeholder="linkedin.com/in/you"
                value={p.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input
                className={inputCls}
                placeholder="2348012345678"
                value={p.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Your accent color</label>
            <div className="flex gap-3">
              {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => set("accent", k)}
                  className="h-9 w-9 rounded-full transition"
                  style={{
                    background: ACCENTS[k],
                    outline:
                      p.accent === k
                        ? "2px solid var(--bone)"
                        : "none",
                    outlineOffset: 3,
                  }}
                  aria-label={k}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button className={saveCls} onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save profile"}
            </button>
            {msg && (
              <p
                className="text-sm"
                style={{
                  color: msg.includes("failed")
                    ? "var(--ember)"
                    : "var(--surf)",
                }}
              >
                {msg}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
