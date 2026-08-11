"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const links = [
  { label: "Home", href: "#home" },
  { label: "The Idea", href: "#idea" },
  { label: "Members", href: "#members" },
  { label: "Join", href: "/join" },
];

const navCls =
  "fixed left-1/2 top-4 z-50 flex w-[92%] max-w-3xl " +
  "-translate-x-1/2 items-center justify-between rounded-full " +
  "border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md";

const linkWrapCls =
  "flex items-center gap-4 text-xs font-medium " +
  "text-neutral-300 sm:gap-6 sm:text-sm";

const linkCls = "transition-colors hover:text-[var(--eye)]";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2, ease: [0.22, 1, 0.36, 1] }}
      className={navCls}
    >
      <a href="#home" className="flex items-center gap-2">
        <Image src="/eagle.svg" alt="G100" width={44} height={28} className="h-auto w-10 invert" />
      </a>
      <div className={linkWrapCls}>
        {links.map((l) => (
          <a key={l.href} href={l.href} className={linkCls}>
            {l.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}


