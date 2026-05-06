import { motion, useSpring, useMotionValue } from "framer-motion";
import React, { useEffect, useState } from "react";

const SPRING = { mass: 0.1, damping: 10, stiffness: 131 };

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);

  useEffect(() => {
    setMounted(true);
    const handlePointerMove = (e: PointerEvent) => {
      xSpring.set(e.clientX - 10);
      ySpring.set(e.clientY - 10);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        x: xSpring,
        y: ySpring,
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full bg-green-500/50 backdrop-blur-sm mix-blend-screen"
    />
  );
}
