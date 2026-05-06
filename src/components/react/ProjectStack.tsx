import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { StickyCard_001 } from '../ui/skiper-ui/skiper16';

export default function ProjectStack({ projects }: { projects: any[] }) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <div ref={container} className="relative flex w-full flex-col items-center justify-center pb-[10vh] pt-[10vh]">
        {projects.map((proj, i) => {
          const targetScale = Math.max(0.9, 1 - (projects.length - i - 1) * 0.05);
          return (
            <StickyCard_001
              key={`p_${i}`}
              i={i}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
              className={`proj-card card-polished hover-${proj.color} shadow-2xl`}
            >
              <div className="proj-img">
                {proj.diagram === 'golf' && (
                  <img src={proj.imageSrc} alt="cade.golf screenshot" className="w-full h-full object-cover opacity-85 transition-opacity duration-300 hover:opacity-100 hover:scale-105" loading="lazy" />
                )}
                {proj.diagram === 'ai' && (
                  <div className="tech-diagram diag-b">
                    <svg viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="100" y="60" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="2" />
                      <rect x="105" y="70" width="50" height="2" fill="currentColor" opacity="0.4" />
                      <rect x="105" y="80" width="50" height="2" fill="currentColor" opacity="0.4" />
                      <path d="M160 90h40" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M200 60 L240 90 L200 120 Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="280" cy="90" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
                      <path d="M270 90h20M280 80v20" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                {proj.diagram === 'ops' && (
                  <div className="tech-diagram diag-p">
                    <svg viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="200" cy="90" r="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
                      <path d="M150 90h100M200 40v100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                      <path d="M170 70 L210 90 L170 110 Z" fill="currentColor" opacity="0.8" />
                      <rect x="230" y="80" width="40" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M80 80 L120 80 L100 100 Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                {proj.diagram === 'edu' && (
                  <div className="tech-diagram diag-a">
                    <svg viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="120" y="50" width="160" height="80" rx="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M140 70h120M140 85h80M140 100h100" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                      <circle cx="200" cy="140" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M180 50 L200 30 L220 50" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="proj-num">{proj.num}</div>
              <h3 className="proj-name">{proj.name}</h3>
              <p className="proj-desc">{proj.desc}</p>
              
              {proj.stack && (
                <div className="proj-stack">
                  {proj.stack.join(' · ')}
                </div>
              )}

              {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="proj-link">{proj.linkText}</a>}
            </StickyCard_001>
          );
        })}
      </div>
    </ReactLenis>
  );
}
