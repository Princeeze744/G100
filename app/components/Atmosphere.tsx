"use client";

export default function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* the sun - top right, where the eye lives */}
      <div
        className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-[0.13] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--eye), transparent 65%)",
        }}
      />
      {/* sunset ember - low left, the beach horizon */}
      <div
        className="absolute -bottom-52 -left-40 h-[38rem] w-[38rem] rounded-full opacity-[0.1] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--ember), transparent 65%)",
        }}
      />
      {/* one whisper of the Atlantic */}
      <div
        className="absolute left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full opacity-[0.05] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--surf), transparent 65%)",
        }}
      />
    </div>
  );
}

