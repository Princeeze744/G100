"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, initials } from "../../lib/social";
import SideDrawer from "./SideDrawer";

export default function MobileTabs() {
  const pathname = usePathname();
  const [uid, setUid] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      setUid(id);
      if (id) {
        const { data: p } = await supabase.from("profiles").select("full_name, photo_url, accent").eq("id", id).single();
        setMe(p);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUid(s?.user?.id || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const count = async () => {
      const { count: c } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("read", false);
      setUnread(c || 0);
    };
    count();
    const ch = supabase.channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: "user_id=eq." + uid }, count)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid]);

  // edge swipe to open drawer
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (startX > 32) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      if (dx > 70 && dy < 60) setDrawer(true);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const accent = ACCENTS[me?.accent || "eye"];

  const tabs = [
    { href: "/", label: "Home", icon: "\u2302" },
    { href: "/threads", label: "Threads", icon: "\u25C8" },
    { href: "/notifications", label: "Alerts", icon: "\u25C9", badge: unread },
  ];

  return (
    <>
      <SideDrawer open={drawer} onClose={() => setDrawer(false)} />

      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0d0b09]/85 px-4 py-2.5 backdrop-blur-xl sm:hidden">
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: accent }}>
          {me?.photo_url ? (
            <img src={me.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[0.6rem]" style={{ color: accent }}>{uid ? initials(me?.full_name) : "\u2261"}</span>
          )}
        </button>
        <Link href="/"><img src="/eagle.svg" alt="G100" className="h-6 w-auto invert" /></Link>
        <Link href="/bookmarks" aria-label="Bookmarks" className="text-lg" style={{ color: "var(--smoke)" }}>{"\u2606"}</Link>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0b09]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="flex items-stretch justify-around">
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
            return (
              <Link key={t.href} href={t.href} className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5">
                <span className="text-lg" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.icon}</span>
                <span className="text-[0.6rem]" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.label}</span>
                {!!t.badge && t.badge > 0 && (
                  <span className="absolute right-[24%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ember)] px-1 text-[0.55rem] font-bold text-white">
                    {t.badge > 9 ? "9+" : t.badge}
                  </span>
                )}
                {active && <motion.span layoutId="tab-dot" className="absolute bottom-0 h-0.5 w-8 rounded-full" style={{ background: "var(--eye)" }} />}
              </Link>
            );
          })}

          <button onClick={() => setDrawer(true)} className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5" aria-label="Menu">
            <span className="flex h-[1.35rem] w-[1.35rem] items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: accent }}>
              {me?.photo_url ? (
                <img src={me.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[0.5rem]" style={{ color: accent }}>{uid ? initials(me?.full_name) : "\u2261"}</span>
              )}
            </span>
            <span className="text-[0.6rem] text-[var(--smoke)]">{uid ? "You" : "Menu"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

