// src/components/CrossedMarqueeTape.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkle } from "lucide-react";
import { ACTIVE_THEME, type DuotoneTheme } from "@/constants";

export interface CrossedMarqueeTapeProps {
  theme?: DuotoneTheme;
  /** Items on the upper-tilted dark back ribbon */
  backItems?: readonly string[];
  /** Items on the lower-tilted high-contrast front ribbon */
  frontItems?: readonly string[];
  /** "editorial-paper" matches the off-white/black screenshot; "duotone-accent" uses theme.accent */
  variant?: "editorial-paper" | "duotone-accent";
  motionEnabled?: boolean;
  speedSeconds?: number;
  className?: string;
}

const DEFAULT_BACK_ITEMS = [
  "JAVA",
  "SPRING BOOT",
  "POSTGRESQL",
  "NEXT.JS",
  "TYPESCRIPT",
  "NODE.JS",
  "RUST + TAURI",
  "REACT NATIVE",
  "LANGGRAPH",
  "DOCKER",
] as const;

const DEFAULT_FRONT_ITEMS = [
  "BUILT TO SHIP",
  "CLEAN ARCHITECTURE",
  "AI-NATIVE WORKFLOWS",
  "ZERO BLOAT",
  "DETAIL OBSESSED",
] as const;

function FourPointStar({ color }: { color: string }) {
  return (
    <Sparkle
      size={13}
      color={color}
      fill={color}
      strokeWidth={1.25}
      aria-hidden="true"
      className="shrink-0"
      />
  );
}

export function CrossedMarqueeTape({
  theme = ACTIVE_THEME,
  backItems = DEFAULT_BACK_ITEMS,
  frontItems = DEFAULT_FRONT_ITEMS,
  variant = "duotone-accent",
  motionEnabled = true,
  speedSeconds = 24,
  className = "",
}: CrossedMarqueeTapeProps) {
  const prefersReducedMotion = useReducedMotion();
  const isAnimating = motionEnabled && !prefersReducedMotion;

  const isPaper = variant === "editorial-paper";

  // Back ribbon: theme canvas strip with crisp theme typography
  const backBg = theme.bg;
  const backText = theme.textPrimary;
  const backBorder = isPaper ? "rgba(243, 241, 234, 0.22)" : theme.borderStrong;
  const backStar = isPaper ? "#F3F1EA" : theme.accent;

  // Front ribbon: warm paper (#EDE9DF) or active duotone accent with dark ink border & type
  const frontBg = isPaper ? "#EDE9DF" : theme.accent;
  const frontText = isPaper ? "#0A0A0C" : theme.accentContrast;
  const frontBorder = isPaper ? "#0A0A0C" : theme.accentContrast;

  // Repeat 4x so ultra-wide 4K monitors never show an empty seam
  const repeatedBack = [...backItems, ...backItems, ...backItems, ...backItems];
  const repeatedFront = [
    ...frontItems,
    ...frontItems,
    ...frontItems,
    ...frontItems,
  ];

  return (
    <div
      aria-label="Capabilities and tech stack ticker"
      className={`relative z-30 h-36 w-full overflow-hidden select-none sm:h-48 ${className}`}
      >
      {/* RIBBON 1 (BACK): Tilted Upward Left-to-Right (-2.1deg) */}
      <div
        style={{
          backgroundColor: backBg,
          color: backText,
          borderColor: backBorder,
        }}
        className="absolute -left-[8vw] top-1/2 z-10 w-[116vw] -translate-y-1/2 -rotate-[2.1deg] border-y py-3.5 shadow-md sm:py-4"
        >
        <motion.div
          animate={isAnimating ? { x: ["0%", "-50%"] } : { x: "0%" }}
          transition={
            isAnimating
          ? { repeat: Infinity, ease: "linear", duration: speedSeconds }
          : { duration: 0 }
          }
          className="flex w-max items-center gap-5 whitespace-nowrap sm:gap-6"
          >
          {repeatedBack.map((item, idx) => (
            <span
              key={`back-${idx}`}
              aria-hidden={idx >= backItems.length}
              className="inline-flex items-center gap-5 sm:gap-6"
              >
              <span
                style={{ fontFamily: "var(--font-poster), sans-serif" }}
                className="text-2xl font-black uppercase leading-none tracking-[0.06em] sm:text-[34px]"
                >
                {item}
              </span>
              <FourPointStar color={backStar} />
            </span>
          ))}
        </motion.div>
      </div>

      {/* RIBBON 2 (FRONT): Tilted Downward Left-to-Right (+2.1deg), Crossing Over Ribbon 1 */}
      <div
        style={{
          backgroundColor: frontBg,
          color: frontText,
          borderColor: frontBorder,
        }}
        className="absolute -left-[8vw] top-1/2 z-20 w-[116vw] -translate-y-1/2 rotate-[2.1deg] border-y-2 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:py-4"
        >
        <motion.div
          animate={isAnimating ? { x: ["-50%", "0%"] } : { x: "-12%" }}
          transition={
            isAnimating
            ? {
              repeat: Infinity,
              ease: "linear",
              duration: speedSeconds * 0.9,
            }
          : { duration: 0 }
          }
          className="flex w-max items-center gap-5 whitespace-nowrap sm:gap-6"
          >
          {repeatedFront.map((item, idx) => (
            <span
              key={`front-${idx}`}
              aria-hidden={idx >= frontItems.length}
              className="inline-flex items-center gap-5 sm:gap-6"
              >
              <span
                style={{ fontFamily: "var(--font-poster), sans-serif" }}
                className="text-2xl font-black uppercase leading-none tracking-[0.06em] sm:text-[34px]"
                >
                {item}
              </span>
              <FourPointStar color={frontText} />
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
