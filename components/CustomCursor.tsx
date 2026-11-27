// src/components/CustomCursor.tsx
"use client";

import { useEffect, useId, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ACTIVE_THEME, type DuotoneTheme } from "@/constants";

export interface CustomCursorProps {
  theme?: DuotoneTheme;
  enabled?: boolean;
}

const THEME_ARROW_GRADIENTS: Record<
  string,
{ start: string; end: string; glow: string }
  > = {
  "dark-lime": {
    start: "#6FA800",
    end: "#CEFF29",
    glow: "rgba(175, 230, 7, 0.45)",
  },
  "black-blaze": {
    start: "#CC3D00",
    end: "#FF9838",
    glow: "rgba(255, 103, 0, 0.45)",
  },
  "oxford-vista": {
    start: "#4A6CF7",
    end: "#BDD0FF",
    glow: "rgba(146, 172, 255, 0.48)",
  },
  "black-powder": {
    start: "#8FA3B0",
    end: "#FFFFFF",
    glow: "rgba(235, 241, 245, 0.38)",
  },
};

const TRAIL_STEPS = [
  { size: 9, opacity: 0.85, stiffness: 360, damping: 26 },
  { size: 7.5, opacity: 0.68, stiffness: 290, damping: 25 },
  { size: 6, opacity: 0.5, stiffness: 230, damping: 24 },
  { size: 4.5, opacity: 0.34, stiffness: 185, damping: 23 },
  { size: 3.5, opacity: 0.2, stiffness: 145, damping: 22 },
] as const;

export function CustomCursor({
  theme = ACTIVE_THEME,
  enabled = true,
}: CustomCursorProps) {
  const prefersReducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  // Raw pointer coordinates (0ms lag for primary arrow tip)
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Surrounding orbital reticle spring
  const ringX = useSpring(rawX, { stiffness: 250, damping: 24, mass: 0.45 });
  const ringY = useSpring(rawY, { stiffness: 250, damping: 24, mass: 0.45 });

  // Staggered spring trail dots
  const trail0X = useSpring(rawX, { stiffness: 360, damping: 26, mass: 0.35 });
  const trail0Y = useSpring(rawY, { stiffness: 360, damping: 26, mass: 0.35 });
  const trail1X = useSpring(rawX, { stiffness: 290, damping: 25, mass: 0.4 });
  const trail1Y = useSpring(rawY, { stiffness: 290, damping: 25, mass: 0.4 });
  const trail2X = useSpring(rawX, { stiffness: 230, damping: 24, mass: 0.45 });
  const trail2Y = useSpring(rawY, { stiffness: 230, damping: 24, mass: 0.45 });
  const trail3X = useSpring(rawX, { stiffness: 185, damping: 23, mass: 0.5 });
  const trail3Y = useSpring(rawY, { stiffness: 185, damping: 23, mass: 0.5 });
  const trail4X = useSpring(rawX, { stiffness: 145, damping: 22, mass: 0.55 });
  const trail4Y = useSpring(rawY, { stiffness: 145, damping: 22, mass: 0.55 });

  const trailSprings = [
    { x: trail0X, y: trail0Y },
    { x: trail1X, y: trail1Y },
    { x: trail2X, y: trail2Y },
    { x: trail3X, y: trail3Y },
    { x: trail4X, y: trail4Y },
  ];

  // Detect desktop fine-pointer devices only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Hide default OS cursor & attach global pointer listeners
  useEffect(() => {
    if (!isFinePointer || !enabled) return;

    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      const customTag = target?.closest("[data-cursor]") as HTMLElement | null;
      if (customTag) {
        setHoverLabel(customTag.getAttribute("data-cursor") || "VIEW");
        return;
      }

      const interactive = target?.closest(
        'a, button, [role="button"], input, textarea, select'
      );
      setHoverLabel(interactive ? "" : null);
    };

    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [isFinePointer, enabled, isVisible, rawX, rawY]);

  if (!isFinePointer || !enabled) {
    return null;
  }

  const palette = THEME_ARROW_GRADIENTS[theme.id] ?? {
    start: theme.accent,
    end: theme.textPrimary,
    glow: theme.spotlightRgba,
  };

  const isHoveringInteractive = hoverLabel !== null;
  const hasBadgeText = Boolean(hoverLabel && hoverLabel.length > 0);
  const gradId = `cursor-arrow-grad-${uid}`;

  return (
    <>
      <style jsx global>{`
        html.custom-cursor-active,
        html.custom-cursor-active * {
          cursor: none !important;
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{ opacity: isVisible ? 1 : 0 }}
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-150"
        >
        {/* Layer 1: Tapered Trailing Dot Chain (Comet Tail) */}
        {!prefersReducedMotion &&
          TRAIL_STEPS.map((step, idx) => (
            <motion.span
              key={idx}
              style={{
                x: trailSprings[idx].x,
                y: trailSprings[idx].y,
                width: step.size,
                height: step.size,
                backgroundColor: theme.accent,
                opacity: isHoveringInteractive ? step.opacity * 0.35 : step.opacity,
                boxShadow: `0 0 8px ${palette.glow}`,
              }}
              className="fixed left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-150"
              />
          ))}

        {/* Layer 2: Surrounding Orbital Reticle / Morphing Hover Pill */}
        <motion.div
          style={{
            x: ringX,
            y: ringY,
          }}
          className="fixed left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          >
          {hasBadgeText ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: isPressed ? 0.94 : 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              style={{
                backgroundColor: theme.accent,
                color: theme.accentContrast,
                boxShadow: `0 8px 24px ${palette.glow}`,
              }}
              className="ml-8 mt-6 inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
              >
              {hoverLabel}
            </motion.div>
          ) : (
            <motion.div
              animate={{
                scale: isPressed ? 0.82 : isHoveringInteractive ? 1.38 : 1,
                rotate: prefersReducedMotion ? 0 : 360,
              }}
              transition={{
                scale: { type: "spring", stiffness: 340, damping: 24 },
                rotate: {
                  repeat: Infinity,
                  ease: "linear",
                  duration: 14,
                },
              }}
              className="flex h-14 w-14 items-center justify-center"
              >
              <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible">
                {/* Outer Dashed Telemetry Orbit */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth={isHoveringInteractive ? "1.5" : "1"}
                  strokeDasharray={isHoveringInteractive ? "none" : "4 5"}
                  opacity={isHoveringInteractive ? 0.85 : 0.45}
                  />
                {/* Orbital Micro-Nodes on the Ring */}
                <circle cx="24" cy="4" r="1.8" fill={theme.accent} />
                <circle cx="24" cy="44" r="1.4" fill={theme.textPrimary} opacity="0.7" />
              </svg>
            </motion.div>
          )}
        </motion.div>

        {/* Layer 3: Beveled Gradient Arrow Pointer (Exact Hotspot at Tip) */}
        <motion.div
          style={{
            x: rawX,
            y: rawY,
          }}
          animate={{
            scale: isPressed ? 0.88 : isHoveringInteractive ? 1.08 : 1,
            rotate: isPressed ? -6 : 0,
          }}
          transition={{ type: "spring", stiffness: 450, damping: 26 }}
          className="fixed left-0 top-0 origin-top-left"
          >
          <svg
            width="38"
            height="38"
            viewBox="0 0 32 32"
            fill="none"
            style={{
              filter: `drop-shadow(0 4px 10px ${palette.glow})`,
            }}
            className="-ml-[2px] -mt-[2px] overflow-visible"
            >
            <defs>
              <linearGradient
                id={gradId}
                x1="3"
                y1="4"
                x2="27"
                y2="25"
                gradientUnits="userSpaceOnUse"
                >
                <stop offset="0%" stopColor={palette.start} />
                <stop offset="100%" stopColor={palette.end} />
              </linearGradient>
            </defs>

            {/* Rounded Tactile Pointer Body (Hotspot at 3.5, 3.5) */}
            <path
              d="M4.2 3.4C2.9 2.9 1.7 4.1 2.2 5.4L9.4 26.8C9.9 28.2 11.8 28.4 12.6 27.1L16.5 20.6C16.8 20.1 17.3 19.7 17.9 19.5L25.4 17.2C26.8 16.8 27.1 14.9 25.8 14.1L4.2 3.4Z"
              fill={`url(#${gradId})`}
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth="1.15"
              strokeLinejoin="round"
              />

            {/* Internal Starlight Micro-Specks (Matching Reference Image) */}
            <circle cx="8.5" cy="9.5" r="0.65" fill="#FFFFFF" opacity="0.85" />
            <circle cx="14.2" cy="12.1" r="0.55" fill="#FFFFFF" opacity="0.7" />
            <circle cx="10.8" cy="16.4" r="0.6" fill="#FFFFFF" opacity="0.75" />
            <circle cx="18.5" cy="15.0" r="0.5" fill="#FFFFFF" opacity="0.65" />
            <circle cx="11.4" cy="21.5" r="0.55" fill="#FFFFFF" opacity="0.6" />
          </svg>
        </motion.div>
      </div>
    </>
  );
}
