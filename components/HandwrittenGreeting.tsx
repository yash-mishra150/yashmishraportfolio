// src/components/HandwrittenGreeting.tsx
"use client";

import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export interface HandwrittenGreetingProps {
  text: string;
  textColor: string;
  accentColor: string;
  motionEnabled: boolean;
  onWriteComplete?: () => void;
}

export function HandwrittenGreeting({
  text,
  textColor,
  accentColor,
  motionEnabled,
  onWriteComplete,
}: HandwrittenGreetingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const nibRef = useRef<SVGGElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const clipId = `greeting-write-clip-${uid}`;

  // Initial width estimate prevents layout shift before font metrics settle
  const [boxWidth, setBoxWidth] = useState<number>(() =>
    Math.max(text.length * 14.5, 110)
                                                  );

  useGSAP(
    () => {
      let cancelled = false;

      const run = async () => {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
        if (cancelled || !textRef.current || !clipRectRef.current || !nibRef.current) {
          return;
        }

        const measured = Math.ceil(textRef.current.getBBox().width);
        const w = measured > 0 ? measured : boxWidth;
        const fullClipWidth = w + 28;
        setBoxWidth(w);

        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          if (!motionEnabled) {
            gsap.set(clipRectRef.current, { attr: { width: fullClipWidth } });
            gsap.set(nibRef.current, { opacity: 0 });
            return;
          }

          const tl = gsap.timeline({
            delay: 0.22,
            onComplete: () => onWriteComplete?.(),
          });

          // Reset ink mask & place pen nib at start of "H"
          tl.set(clipRectRef.current, { attr: { width: 0 } });
          tl.set(nibRef.current, { x: 2, y: 24, opacity: 1, scale: 1 });

          // 1. Progressive slanted ink wipe following the pen nib
          tl.to(
            clipRectRef.current,
            {
              attr: { width: fullClipWidth },
              duration: 1.15,
              ease: "power1.inOut",
            },
            0
          );

          // 2. Horizontal pen travel across the word
          tl.to(
            nibRef.current,
            {
              x: w + 3,
              duration: 1.15,
              ease: "power1.inOut",
            },
            0
          );

          // 3. Natural vertical hand-stroke cadence over ascenders & bowls
          tl.to(
            nibRef.current,
            {
              keyframes: [
                { y: 14, duration: 0.16 },
                { y: 26, duration: 0.16 },
                { y: 13, duration: 0.18 },
                { y: 26, duration: 0.17 },
                { y: 14, duration: 0.16 },
                { y: 24, duration: 0.16 },
                { y: 20, duration: 0.16 },
              ],
              ease: "sine.inOut",
            },
            0
          );

          // 4. Pen lifts cleanly off the page once the final stroke finishes
          tl.to(
            nibRef.current,
            {
              y: "-=7",
              opacity: 0,
              scale: 0.5,
              duration: 0.22,
              ease: "power2.out",
            },
            "-=0.06"
          );
        });

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(clipRectRef.current, { attr: { width: fullClipWidth } });
          gsap.set(nibRef.current, { opacity: 0 });
        });
      };

      run();

      return () => {
        cancelled = true;
      };
    },
    { scope: wrapperRef, dependencies: [text, motionEnabled, prefersReducedMotion] }
  );

  const viewWidth = boxWidth + 16;

  return (
    <div ref={wrapperRef} className="inline-flex items-center select-none">
      <svg
        viewBox={`0 0 ${viewWidth} 44`}
        className="h-9 w-auto overflow-visible sm:h-11"
        role="img"
        aria-label={text}
        >
        <defs>
          <clipPath id={clipId}>
            <rect
              ref={clipRectRef}
              x="-12"
              y="-4"
              width={viewWidth + 24}
              height="52"
              transform="skewX(-14)"
              />
          </clipPath>
        </defs>

        {/* Handwritten Caveat Text Revealed Under the Pen */}
        <g clipPath={`url(#${clipId})`}>
          <text
            ref={textRef}
            x="2"
            y="33"
            fill={textColor}
            style={{ fontFamily: "var(--font-caveat), cursive" }}
            className="text-[34px] font-semibold tracking-normal"
            >
            {text}
          </text>
        </g>

        {/* Live Writing Pen Nib + Accent Ink Glow */}
        <g ref={nibRef} opacity={0} aria-hidden="true">
          <circle r="7.5" fill={accentColor} opacity="0.24" />
          <line
            x1="0"
            y1="0"
            x2="8"
            y2="-12"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            />
          <circle r="2.5" fill={accentColor} />
        </g>
      </svg>
    </div>
  );
}
