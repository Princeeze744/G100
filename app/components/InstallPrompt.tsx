"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) return;

    const dismissed = localStorage.getItem("g100-install-dismissed");
    if (dismissed) return;

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios/i.test(navigator.userAgent);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIos) {
      setIos(true);
      setTimeout(() => setShow(true), 5000);
    }

    return () =>
      window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("g100-install-dismissed", "1");
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-24 left-1/2 z-[60] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-[var(--eye)]/30 bg-[#161310]/95 p-4 backdrop-blur-xl"
          style={{ boxShadow: "0 10px 50px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-start gap-3">
            <img
              src="/icon.png"
              alt="G100"
              className="h-12 w-12 rounded-xl"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">Install G100</p>
              {ios ? (
                <p className="mt-0.5 text-xs text-neutral-400">
                  Tap the Share icon, then &quot;Add to Home
                  Screen&quot;.
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-neutral-400">
                  Add G100 to your home screen. Full app, offline
                  ready.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {!ios && (
              <button
                onClick={install}
                className="flex-1 rounded-full bg-[var(--eye)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:opacity-85"
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-neutral-400 transition hover:text-white"
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
