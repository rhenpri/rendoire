import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { CharacterV1 } from '../ui/skiper-ui/skiper31';

export default function AnimatedHeading({ text, className }: { text: string, className?: string }) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "center center"],
  });

  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  return (
    <div
      ref={targetRef}
      className={`relative box-border flex items-center justify-start overflow-hidden py-4 ${className || ''}`}
      style={{ perspective: "500px" }}
    >
      {characters.map((char, index) => (
        <CharacterV1
          key={index}
          char={char}
          index={index}
          centerIndex={centerIndex}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
