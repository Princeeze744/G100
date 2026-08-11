"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const navCls =
  "fixed left-1/2 top-4 z-50 flex w-[92%] max-w-3xl " +
  "-translate-x-1/2 items-center justify-between rounded-full " +
  "border border-white/10 bg-black/30 px-5 py-2.5 backdrop-blur-md";

const linkWrapCls =
  "flex items-center gap-4 text-xs font-medium " +
  "text-neutral-300 sm:gap-6 sm:text-sm";

const linkCls = "transition-colors hover:text-[var(--eye)]";

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user) {
        const { data: me } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(!!me?.is_admin);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e, session) => setLoggedIn(!!session)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const home = pathname === "/";
  const anchor = (hash: string) => (home ? hash : "/" + hash);

  const links = [
    { label: "Home", href: home ? "#home" : "/" },
    { label: "The Idea", href: anchor("#idea") },
    { label: "The 100", href: anchor("#members") },
    { label: "The Life", href: anchor("#life") },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: home ? 2 : 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={navCls}
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/eagle.svg"
          alt="G100"
          width={44}
          height={28}
          className="h-auto w-10 invert"
        />
      </Link>

      <div className={linkWrapCls}>
        {links.map((l) =>
          l.href.startsWith("#") ? (
            <a key={l.label} href={l.href} className={linkCls}>
              {l.label}
            </a>
          ) : (
            <Link key={l.label} href={l.href} className={linkCls}>
              {l.label}
            </Link>
          )
        )}

        {isAdmin && (
          <Link href="/admin" className={linkCls}>
            Gate
          </Link>
        )}
        {loggedIn ? (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-full border border-[var(--eye)]/40 px-3 py-1 text-[var(--eye)] transition hover:bg-[var(--eye)]/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--eye)]" />
            Profile
          </Link>
        ) : (
          <Link
            href="/join"
            className="rounded-full border border-white/20 px-3 py-1 transition hover:border-[var(--eye)] hover:text-[var(--eye)]"
          >
            Join
          </Link>
        )}
      </div>
    </motion.nav>
  );
}


