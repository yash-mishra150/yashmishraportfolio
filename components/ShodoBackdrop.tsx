// src/components/ShodoBackdrop.tsx
"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import {
  ACTIVE_THEME,
  SHODO_STROKES,
  SHODO_VIEWBOX,
  type DuotoneTheme,
} from "@/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin, useGSAP);
}

export interface ShodoBackdropProps {
  replayKey?: number;
  theme?: DuotoneTheme;
  className?: string;
}

export function ShodoBackdrop({
  replayKey = 0,
  theme = ACTIVE_THEME,
  className = "",
}: ShodoBackdropProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay: 0.16 });

        tl.set(".shodo-mask-path", { drawSVG: "0%" });
        tl.set(".shodo-artwork", { opacity: 1 });
        tl.to(".shodo-mask-path", {
          drawSVG: "0% 100%",
          duration: 0.34,
          stagger: 0.055,
          ease: "power2.out",
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".shodo-mask-path", { drawSVG: "0% 100%" });
        gsap.fromTo(
          ".shodo-artwork",
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power1.out" }
        );
      });
    },
    { scope: svgContainerRef, dependencies: [replayKey] }
  );

  const gradId = `shodoGrad-${uid}`;
  const filterId = `shodoInk-${uid}`;

  return (
    <div
      ref={svgContainerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      >
      <svg
        viewBox={SHODO_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
        >
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="20"
            x2="0"
            y2="295"
            >
            <stop
              offset="0%"
              stopColor={theme.shodoStart}
              stopOpacity={theme.shodoStartOpacity}
              />
            <stop
              offset="65%"
              stopColor={theme.shodoMid}
              stopOpacity={theme.shodoMidOpacity}
              />
            <stop offset="100%" stopColor={theme.bg} stopOpacity={0.01} />
          </linearGradient>

          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves={2}
              seed={7}
              result="noise"
              />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={1.8}
              xChannelSelector="R"
              yChannelSelector="G"
              />
          </filter>

          {SHODO_STROKES.map((stroke) => (
          <mask
            key={`mask-${stroke.id}`}
            id={`shodo-mask-${uid}-${stroke.id}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="660"
            height="315"
            >
            <path
              d={stroke.center}
              fill="none"
              stroke="#ffffff"
              strokeWidth={stroke.maskWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shodo-mask-path"
              />
          </mask>
        ))}
        </defs>

        <g
          className="shodo-artwork opacity-0"
          filter={`url(#${filterId})`}
          fill={`url(#${gradId})`}
          >
          {SHODO_STROKES.map((stroke) => (
            <g
              key={`stroke-${stroke.id}`}
              mask={`url(#shodo-mask-${uid}-${stroke.id})`}
              >
              <path d={stroke.fill} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
