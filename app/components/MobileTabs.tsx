"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

export default function MobileTabs() {
  const pathname = usePathname();
  const [uid, setUid] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id || null));
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

  const tabs = [
    { href: "/", label: "Home", icon: "\u2302" },
    { href: "/threads", label: "Threads", icon: "\u25C8" },
    { href: "/notifications", label: "Alerts", icon: "\u25C9", badge: unread },
    { href: uid ? "/profile" : "/login", label: uid ? "You" : "Log in", icon: "\u25CF" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0b09]/95 backdrop-blur-xl sm:hidden">
      <div className="flex items-stretch justify-around">
        {tabs.map((t) => {
          const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
          return (
            <Link key={t.href} href={t.href} className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5">
              <span className="text-lg" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.icon}</span>
              <span className="text-[0.6rem]" style={{ color: active ? "var(--eye)" : "var(--smoke)" }}>{t.label}</span>
              {!!t.badge && t.badge > 0 && (
                <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ember)] px-1 text-[0.55rem] font-bold text-white">
                  {t.badge > 9 ? "9+" : t.badge}
                </span>
              )}
              {active && (
                <motion.span layoutId="tab-dot" className="absolute bottom-0 h-0.5 w-8 rounded-full" style={{ background: "var(--eye)" }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
