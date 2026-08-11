"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthShell({
  children,
  headline,
  sub,
}: {
  children: React.ReactNode;
  headline: string;
  sub: string;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      {/* the eagle ghost - hanging in the dark behind the glass */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.15, y: 20 }}
        animate={{ opacity: 0.07, scale: 1, y: 0 }}
        transition={{ duration: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[140vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 sm:w-[80vw]"
      >
        <Image
          src="/eagle.svg"
          alt=""
          width={1297}
          height={683}
          className="h-auto w-full invert"
        />
      </motion.div>

      {/* amber pulse behind the panel */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--eye), transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.9,
          delay: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
        style={{ boxShadow: "0 0 80px rgba(232,163,61,0.07)" }}
      >
        <Link href="/" className="mb-8 inline-block">
          <Image
            src="/eagle.svg"
            alt="G100"
            width={88}
            height={56}
            className="h-auto w-20 invert"
          />
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-2 text-3xl font-bold tracking-tight"
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-8 text-sm text-neutral-400"
        >
          {sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </main>
  );
}
