"use client";

import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";
import { ACCENTS } from "../../lib/social";
import { Avatar } from "./SocialUI";

export function Composer({ uid, me, onPosted }: { uid: string; me: any; onPosted: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");
  const accent = ACCENTS[me?.accent || "eye"];

  function addFiles(list: FileList) {
    const next = [...files, ...Array.from(list)].slice(0, 4);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }
  function removeFile(i: number) {
    const next = files.filter((_, x) => x !== i);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function submit() {
    if (!body.trim() && files.length === 0) return;
    setPosting(true); setErr("");
    const urls: string[] = [];
    for (const file of files) {
      const small = await shrinkImage(file, 1400);
      const path = uid + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + ".jpg";
      const { error: upErr } = await supabase.storage.from("posts").upload(path, small, { contentType: "image/jpeg" });
      if (upErr) { setErr("Upload failed: " + upErr.message); setPosting(false); return; }
      urls.push(supabase.storage.from("posts").getPublicUrl(path).data.publicUrl);
    }
    const { error } = await supabase.from("posts").insert({ author_id: uid, body: body.trim(), image_url: urls[0] || "", image_urls: urls });
    if (error) { setErr("Post failed: " + error.message); setPosting(false); return; }
    setBody(""); setFiles([]); setPreviews([]); setPosting(false);
    onPosted();
  }

  return (
    <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex gap-3">
        <Avatar url={me?.photo_url} name={me?.full_name} accent={accent} size={40} href={"/member/" + uid} />
        <div className="flex-1">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" className="min-h-[60px] w-full resize-none bg-transparent text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500" />
          {previews.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeFile(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white" aria-label="Remove">x</button>
                </div>
              ))}
            </div>
          )}
          {err && <p className="mt-2 text-xs text-[var(--ember)]">{err}</p>}
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => fileRef.current?.click()} disabled={files.length >= 4} className="text-xs text-neutral-400 transition hover:text-[var(--eye)] disabled:opacity-40">
              + Photo {files.length > 0 ? "(" + files.length + "/4)" : ""}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
            <button onClick={submit} disabled={posting || (!body.trim() && files.length === 0)} className="rounded-full px-5 py-2 text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40" style={{ background: accent }}>
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

