"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2200);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-24 left-1/2 z-[95] -translate-x-1/2 rounded-full border border-[var(--eye)]/30 bg-[#161310]/95 px-5 py-3 text-sm text-[var(--bone)] backdrop-blur-xl sm:bottom-8"
            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
