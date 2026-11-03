import { motion, useSpring } from "framer-motion";
import React, { useEffect, useState } from "react";

const SPRING = { mass: 0.35, damping: 26, stiffness: 340 };

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useSpring(-100, SPRING);
  const y = useSpring(-100, SPRING);

  useEffect(() => {
    // Only enable on precise pointer devices (no touch), and honour reduced motion.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest("a, button, [role='button'], input, textarea, select, label"));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
    >
      <motion.div
        animate={{ scale: hovering ? 2.2 : 1, opacity: hovering ? 0.5 : 0.85 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/80 shadow-[0_0_16px_rgba(62,207,142,0.55)]"
      />
    </motion.div>
  );
}
