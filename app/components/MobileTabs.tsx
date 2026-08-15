"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, initials } from "../../lib/social";
import SideDrawer from "./SideDrawer";

export default function MobileTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [dms, setDms] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

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
    const countDms = async () => {
      const { data: cs } = await supabase.from("conversations").select("id").or("user_a.eq." + uid + ",user_b.eq." + uid);
      const ids = (cs || []).map((c: any) => c.id);
      if (!ids.length) { setDms(0); return; }
      const { data: ms } = await supabase.from("messages").select("id, sender_id").in("conversation_id", ids).eq("read", false).neq("sender_id", uid);
      setDms((ms || []).length);
    };
    countDms();
    const onDmRead = () => { setDms(0); setTimeout(countDms, 900); };
    window.addEventListener("g100-dm-read", onDmRead);
    const dmCh = supabase.channel("dm-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, countDms)
      .subscribe();

    count();
    const onRead = () => setUnread(0);
    window.addEventListener("g100-notifs-read", onRead);
    const ch = supabase.channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: "user_id=eq." + uid }, count)
      .subscribe();
    return () => { window.removeEventListener("g100-dm-read", onDmRead); supabase.removeChannel(dmCh); supabase.removeChannel(ch); window.removeEventListener("g100-notifs-read", onRead); };
  }, [uid]);

  // hide chrome on scroll down, reveal on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) { setHidden(false); lastY.current = y; return; }
      const diff = y - lastY.current;
      if (Math.abs(diff) < 8) return;
      setHidden(diff > 0);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accent = ACCENTS[me?.accent || "eye"];
  const showFab = pathname === "/threads";
  const inChat = pathname.startsWith("/messages/");

  const tabs = [
    { href: "/", label: "Home", icon: "\u2302" },
    { href: "/threads", label: "Threads", icon: "\u25C8" },
    { href: "/reels", label: "Reels", icon: "\u25B6" },
    { href: "/messages", label: "Chats", icon: "\u2709", badge: dms },
    { href: "/notifications", label: "Alerts", icon: "\u25C9", badge: unread },
  ];

  return (
    <>
      <SideDrawer open={drawer} onClose={() => setDrawer(false)} />

      {/* slim top bar */}
      {!inChat && (
      <motion.header
        animate={{ y: hidden ? -70 : 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0d0b09]/90 px-2 backdrop-blur-xl sm:hidden"
      >
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex h-12 w-12 items-center justify-center">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: accent }}>
            {me?.photo_url ? (
              <img src={me.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[0.6rem]" style={{ color: accent }}>{uid ? initials(me?.full_name) : "\u2261"}</span>
            )}
          </span>
        </button>
        <Link href="/" className="flex h-12 items-center px-3">
          <img src="/eagle.svg" alt="G100" className="h-6 w-auto invert" />
        </Link>
        <Link href="/bookmarks" aria-label="Bookmarks" className="flex h-12 w-12 items-center justify-center text-xl" style={{ color: "var(--smoke)" }}>
          {"\u2606"}
        </Link>
      </motion.header>
      )}

      {/* compose FAB */}
      <AnimatePresence>
        {showFab && uid && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: hidden ? 0.85 : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => {
                const ta = document.querySelector("textarea") as HTMLTextAreaElement | null;
                ta?.focus();
              }, 350);
            }}
            aria-label="New post"
            className="fixed bottom-[5.5rem] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-light text-[var(--ink)] shadow-lg sm:hidden"
            style={{ background: accent, boxShadow: "0 6px 24px " + accent + "66" }}
          >
            +
          </motion.button>
        )}
      </AnimatePresence>

{!inChat && (
      <motion.nav
        animate={{ y: hidden ? 90 : 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0b09]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      >
        <div className="grid grid-cols-6">
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
            return (
              <Link key={t.href} href={t.href} className="relative flex h-14 flex-col items-center justify-center gap-1">
                <span className="text-xl leading-none" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.icon}</span>
                <span className="text-[0.62rem] leading-none" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.label}</span>
                {!!t.badge && t.badge > 0 && (
                  <span className="absolute right-[26%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ember)] px-1 text-[0.55rem] font-bold text-white">
                    {t.badge > 9 ? "9+" : t.badge}
                  </span>
                )}
                {active && <motion.span layoutId="tab-dot" className="absolute bottom-1 h-0.5 w-7 rounded-full" style={{ background: "var(--eye)" }} />}
              </Link>
            );
          })}

          <button onClick={() => (uid ? router.push("/member/" + uid) : router.push("/login"))} className="relative flex h-14 flex-col items-center justify-center gap-1" aria-label="You">
            <span className="flex h-[1.35rem] w-[1.35rem] items-center justify-center overflow-hidden rounded-full border leading-none" style={{ borderColor: accent }}>
              {me?.photo_url ? (
                <img src={me.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[0.5rem]" style={{ color: accent }}>{uid ? initials(me?.full_name) : "\u2261"}</span>
              )}
            </span>
            <span className="text-[0.62rem] leading-none text-[var(--smoke)]">{uid ? "You" : "Log in"}</span>
          </button>
        </div>
      </motion.nav>
      )}
    </>
  );
}






