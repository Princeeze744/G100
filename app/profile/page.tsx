"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};

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
  accent: string;
  approved: boolean;
};

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/30 " +
  "px-4 py-3 text-sm text-[var(--bone)] outline-none transition " +
  "placeholder:text-neutral-500 focus:border-[var(--eye)]";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase " +
  "tracking-widest text-neutral-500";

const primBtn =
  "rounded-xl bg-[var(--bone)] px-8 py-3 text-sm font-semibold " +
  "text-[var(--ink)] transition hover:bg-[var(--eye)] " +
  "disabled:opacity-50";

const ghostBtn =
  "rounded-xl border border-white/20 px-6 py-3 text-sm " +
  "text-neutral-300 transition hover:border-[var(--eye)] " +
  "hover:text-[var(--eye)]";

const pillCls =
  "rounded-full border border-white/15 px-4 py-1.5 text-xs " +
  "text-neutral-300 transition hover:border-current";

const ease = [0.25, 0.1, 0.25, 1] as const;

function TiltCard({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-7, 7]);
  const rotateX = useTransform(sy, [0, 1], [6, -6]);
  const glowX = useTransform(sx, [0, 1], ["25%", "75%"]);
  const glowY = useTransform(sy, [0, 1], ["25%", "75%"]);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <div style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-3xl border border-white/10"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-40"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                "radial-gradient(circle at " +
                x +
                " " +
                y +
                ", " +
                accent +
                "33, transparent 55%)"
            ),
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}

function Reveal({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [p, setP] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
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
      if (row) {
        setP(row as Profile);
        const empty = !row.role_title && !row.bio && !row.photo_url;
        setEditing(empty);
      }
    });
  }, [router]);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setP((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function uploadPhoto(file: File) {
    if (!userId) return;
    setUploading(true);
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
    if (error) {
      setMsg("Save failed: " + error.message);
      return;
    }
    setEditing(false);
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

  const socials: { label: string; href: string }[] = [];
  if (p.instagram) {
    const u = p.instagram.replace(/^@/, "");
    socials.push({ label: "Instagram", href: "https://instagram.com/" + u });
  }
  if (p.twitter) {
    const u = p.twitter.replace(/^@/, "");
    socials.push({ label: "X", href: "https://x.com/" + u });
  }
  if (p.linkedin) {
    const u = p.linkedin.startsWith("http") ? p.linkedin : "https://" + p.linkedin;
    socials.push({ label: "LinkedIn", href: u });
  }
  if (p.whatsapp) {
    const u = p.whatsapp.replace(/\D/g, "");
    socials.push({ label: "WhatsApp", href: "https://wa.me/" + u });
  }

  // ===================== VIEW MODE =====================
  if (!editing) {
    return (
      <main className="relative mx-auto max-w-2xl px-6 pb-20 pt-28">
        <motion.div
          aria-hidden
          animate={{ opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="pointer-events-none fixed left-1/2 top-1/3 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, " + accent + ", transparent 65%)",
          }}
        />

        <Reveal delay={0.1}>
          <TiltCard accent={accent}>
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
              {p.photo_url ? (
                <Image
                  src={p.photo_url}
                  alt={p.full_name}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 672px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-neutral-600">
                  No photo yet
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(13,11,9,0.95) 0%, rgba(13,11,9,0.35) 45%, transparent 70%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ color: accent }}
                >
                  {p.approved ? "One of the Hundred" : "Awaiting approval"}
                </p>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {p.full_name}
                </h1>
                <p className="mt-1 text-sm text-neutral-300">
                  {p.role_title}
                  {p.city ? " - " + p.city : ""}
                </p>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        {p.bio && (
          <Reveal delay={0.35}>
            <p
              className="mt-10 border-l-2 pl-5 text-lg leading-relaxed text-neutral-200"
              style={{ borderColor: accent }}
            >
              {p.bio}
            </p>
          </Reveal>
        )}

        {p.services && (
          <Reveal delay={0.5}>
            <div className="mt-9">
              <p className={labelCls}>Services</p>
              <p className="text-neutral-300">{p.services}</p>
            </div>
          </Reveal>
        )}

        {p.education && (
          <Reveal delay={0.6}>
            <div className="mt-7">
              <p className={labelCls}>Education</p>
              <p className="text-neutral-300">{p.education}</p>
            </div>
          </Reveal>
        )}

        {socials.length > 0 && (
          <Reveal delay={0.7}>
            <div className="mt-9 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener" className={pillCls} style={{ color: accent }}>
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.85}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <button className={primBtn} onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <button className={ghostBtn} onClick={logout}>
              Log out
            </button>
          </div>
        </Reveal>
      </main>
    );
  }

  // ===================== EDIT MODE =====================
  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-neutral-400 transition hover:text-[var(--eye)]"
          >
            Cancel
          </button>
        </div>

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
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold"
            style={{ color: accent }}
          >
            {uploading ? "Uploading..." : "Change photo"}
          </button>
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
                value={p.role_title}
                onChange={(e) => set("role_title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                value={p.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Bio - your story</label>
            <textarea
              className={inputCls + " min-h-28 resize-y"}
              value={p.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Services</label>
            <textarea
              className={inputCls + " min-h-20 resize-y"}
              value={p.services}
              onChange={(e) => set("services", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Education</label>
            <textarea
              className={inputCls + " min-h-20 resize-y"}
              value={p.education}
              onChange={(e) => set("education", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Instagram</label>
              <input
                className={inputCls}
                value={p.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>X / Twitter</label>
              <input
                className={inputCls}
                value={p.twitter}
                onChange={(e) => set("twitter", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>LinkedIn</label>
              <input
                className={inputCls}
                value={p.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input
                className={inputCls}
                value={p.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Your accent color</label>
            <div className="flex gap-3">
              {Object.keys(ACCENTS).map((k) => (
                <button
                  key={k}
                  onClick={() => set("accent", k)}
                  className="h-9 w-9 rounded-full"
                  style={{
                    background: ACCENTS[k],
                    outline:
                      p.accent === k ? "2px solid var(--bone)" : "none",
                    outlineOffset: 3,
                  }}
                  aria-label={k}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button className={primBtn} onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save profile"}
            </button>
            {msg && (
              <p className="text-sm text-[var(--ember)]">{msg}</p>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
