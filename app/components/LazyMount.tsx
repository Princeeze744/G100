"use client";

import { useEffect, useRef, useState } from "react";

// Renders children only when the visitor approaches.
// Placeholder height preserves scroll length (no layout shift).
export default function LazyMount({
  minH,
  children,
}: {
  minH: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={show ? undefined : { minHeight: minH }}>
      {show ? children : null}
    </div>
  );
}

