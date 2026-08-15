"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, EASE, initials } from "../../lib/social";

const ITEMS = [
  { href: "/threads", label: "Threads", icon: "\u25C8" },
  { href: "/notifications", label: "Notifications", icon: "\u25C9" },
  { href: "/bookmarks", label: "Bookmarks", icon: "\u2606" },
  { href: "/#idea", label: "The Idea", icon: "\u25CE" },
  { href: "/#members", label: "The 100", icon: "\u25C7" },
  { href: "/#life", label: "The Life", icon: "\u25B3" },
  { href: "/eket", label: "Eket Beach", icon: "\u2740" },
];

export default function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      setUid(id);
      if (id) {
        const { data: p } = await supabase.from("profiles").select("full_name, photo_url, accent, role_title, is_admin").eq("id", id).single();
        if (p) { setMe(p); setIsAdmin(!!p.is_admin); }
      }
    });
  }, [open]);

  useEffect(() => { onClose(); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const accent = ACCENTS[me?.accent || "eye"];

  async function logout() {
    await supabase.auth.signOut();
    onClose();
    router.push("/");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm sm:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, info) => { if (info.offset.x < -60) onClose(); }}
            className="fixed bottom-0 left-0 top-0 z-[91] flex w-[80%] max-w-xs flex-col border-r border-white/10 bg-[#0d0b09] sm:hidden"
          >
            <div className="border-b border-white/10 p-5">
              {uid ? (
                <Link href={"/member/" + uid} onClick={onClose} className="block">
                  <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-full border-2" style={{ borderColor: accent }}>
                    {me?.photo_url ? (
                      <img src={me.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-sm text-neutral-300">{initials(me?.full_name)}</div>
                    )}
                  </div>
                  <p className="text-base font-bold">{me?.full_name || "G100 Member"}</p>
                  <p className="text-xs text-neutral-400">{me?.role_title || "Visionary Leader"}</p>
                </Link>
              ) : (
                <div>
                  <Image src="/eagle.svg" alt="G100" width={70} height={45} className="mb-3 h-auto w-16 invert" />
                  <p className="text-sm text-neutral-400">Log in to join the conversation.</p>
                </div>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {ITEMS.map((it, i) => (
                <motion.div
                  key={it.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.035, duration: 0.35, ease: EASE }}
                >
                  <Link href={it.href} onClick={onClose} className="flex items-center gap-4 px-5 py-3.5 text-[0.95rem] text-neutral-200 transition hover:bg-white/[0.05]">
                    <span className="w-5 text-center text-lg" style={{ color: accent }}>{it.icon}</span>
                    {it.label}
                  </Link>
                </motion.div>
              ))}

              {isAdmin && (
                <Link href="/admin" onClick={onClose} className="flex items-center gap-4 px-5 py-3.5 text-[0.95rem] text-neutral-200 transition hover:bg-white/[0.05]">
                  <span className="w-5 text-center text-lg" style={{ color: accent }}>{"\u2691"}</span>
                  The Gate
                </Link>
              )}
            </nav>

            <div className="border-t border-white/10 p-5">
              <a href="https://wa.me/2348012881100" target="_blank" rel="noopener" className="mb-3 flex items-center gap-3 text-sm text-neutral-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#25D366" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </span>
                WhatsApp Group
              </a>
              {uid ? (
                <button onClick={logout} className="text-sm text-neutral-500 transition hover:text-[var(--ember)]">Log out</button>
              ) : (
                <Link href="/login" onClick={onClose} className="inline-block rounded-full px-5 py-2 text-xs font-semibold text-[var(--ink)]" style={{ background: accent }}>Log in</Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
