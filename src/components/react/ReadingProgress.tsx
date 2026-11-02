import { motion, useScroll, useSpring } from "framer-motion";
import React from "react";

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="reading-progress bg-amber-400"
      style={{ scaleX }}
    />
  );
}
