"use client";

import { motion } from "framer-motion";

export default function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
          {kicker}
        </p>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {children}
      </motion.div>
    </section>
  );
}



