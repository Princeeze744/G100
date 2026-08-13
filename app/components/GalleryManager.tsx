"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";

type Shot = {
  id: string;
  image_url: string;
  caption: string;
  album: string;
};

const inputCls =
  "rounded-xl border border-white/15 bg-black/30 px-4 py-3 " +
  "text-sm text-[var(--bone)] outline-none " +
  "placeholder:text-neutral-400 focus:border-[var(--eye)]";

export default function GalleryManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const [album, setAlbum] = useState("");
  const [caption, setCaption] = useState("");

  async function load() {
    const { data } = await supabase
      .from("gallery")
      .select("id, image_url, caption, album")
      .order("created_at", { ascending: false });
    setShots((data || []) as Shot[]);
  }

  useEffect(() => {
    load();
  }, []);

  const albums = useMemo(() => {
    const set = new Set<string>();
    for (const s of shots) if (s.album) set.add(s.album);
    return Array.from(set);
  }, [shots]);

  async function upload(files: FileList) {
    setBusy(true);
    for (const file of Array.from(files)) {
      const path = Date.now() + "-" + file.name.replace(/\s/g, "_");
      const small = await shrinkImage(file, 1400);
      const { error } = await supabase.storage
        .from("gallery")
        .upload(path, small, { contentType: "image/jpeg" });
      if (!error) {
        const { data } = supabase.storage
          .from("gallery")
          .getPublicUrl(path);
        await supabase.from("gallery").insert({
          image_url: data.publicUrl,
          album: album.trim(),
          caption: caption.trim(),
        });
      }
    }
    setCaption("");
    await load();
    setBusy(false);
  }

  async function remove(s: Shot) {
    await supabase.from("gallery").delete().eq("id", s.id);
    const path = s.image_url.split("/gallery/")[1];
    if (path) await supabase.storage.from("gallery").remove([path]);
    load();
  }

  return (
    <div className="mt-14">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
        Gallery ({shots.length})
      </h2>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <input
            className={inputCls + " w-full"}
            list="album-list"
            placeholder="Album (type new or pick existing)"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          />
          <datalist id="album-list">
            {albums.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <input
          className={inputCls + " w-full"}
          placeholder="Caption (optional, per upload)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="mb-6 rounded-xl bg-[var(--eye)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:opacity-85 disabled:opacity-50"
      >
        {busy
          ? "Uploading..."
          : album.trim()
          ? "Upload to \u201C" + album.trim() + "\u201D"
          : "Upload photos"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
        }}
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {shots.map((s) => (
          <div
            key={s.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
          >
            <Image
              src={s.image_url}
              alt={s.caption || s.album || "Gallery"}
              fill
              sizes="120px"
              className="object-cover"
            />
            {s.album && (
              <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] text-neutral-200">
                {s.album}
              </span>
            )}
            <button
              onClick={() => remove(s)}
              aria-label="Delete photo"
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-[var(--ember)] opacity-0 transition group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


