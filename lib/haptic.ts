// Tiny tactile pulse on action. Silently ignored where unsupported.
export function tap(pattern: number | number[] = 8) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}
