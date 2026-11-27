// src/components/HeroSection.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ACTIVE_THEME,
  HERO_CONFIG,
  PORTFOLIO_THEMES,
  type DuotoneTheme,
  type MetricItem,
  type NavLinkItem,
  type SpecRowItem,
} from "@/constants";
import { HandwrittenGreeting } from "./HandwrittenGreeting";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const HeroWebGLCanvas = dynamic(
  () => import("./HeroWebGLCanvas").then((mod) => mod.HeroWebGLCanvas),
  { ssr: false }
);

function parseMetricValue(raw: string): { target: number; suffix: string } {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { target: 0, suffix: raw };
  return {
    target: Number(match[1]),
    suffix: match[2] ?? "",
  };
}

export interface HeroSectionProps {
  initialTheme?: DuotoneTheme;
  /** Controlled theme from the page — overrides internal state when provided */
  theme?: DuotoneTheme;
  /** Called whenever the hero's theme picker changes the theme */
  onThemeChange?: (theme: DuotoneTheme) => void;
  brandBox?: string;
  brandHandle?: string;
  backgroundWord?: string;
  greeting?: string;
  name?: string;
  initials?: string;
  roleLine?: string;
  serifLead?: string;
  serifEmphasis?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  characterSrc?: string;
  navLinks?: readonly NavLinkItem[];
  specRows?: readonly SpecRowItem[];
  metrics?: readonly MetricItem[];
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  onSwitchToXpMode?: () => void;
}

export function HeroSection({
  initialTheme = ACTIVE_THEME,
  theme: themeProp,
  onThemeChange,
  brandBox = HERO_CONFIG.brandBox,
  brandHandle = HERO_CONFIG.brandHandle,
  backgroundWord = HERO_CONFIG.backgroundWord,
  greeting = HERO_CONFIG.greeting,
  name = HERO_CONFIG.name,
  initials = HERO_CONFIG.initials,
  roleLine = HERO_CONFIG.roleLine,
  serifLead = HERO_CONFIG.serifLead,
  serifEmphasis = HERO_CONFIG.serifEmphasis,
  primaryCtaText = HERO_CONFIG.primaryCtaText,
  secondaryCtaText = HERO_CONFIG.secondaryCtaText,
  characterSrc = HERO_CONFIG.characterSrc,
  navLinks = HERO_CONFIG.navLinks,
  specRows = HERO_CONFIG.specRows,
  metrics = HERO_CONFIG.metrics,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  onSwitchToXpMode,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const metricRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Hybrid controlled theme: page state wins when provided, picker updates both
  const [themeState, setThemeState] = useState<DuotoneTheme>(initialTheme);
  const theme = themeProp ?? themeState;
  const setTheme = (next: DuotoneTheme) => {
    setThemeState(next);
    onThemeChange?.(next);
  };
  const [motionEnabled, setMotionEnabled] = useState<boolean>(true);

  const isMotionActive = motionEnabled && !prefersReducedMotion;

  // --- FRAMER MOTION: GPU-Composited 2.5D Mouse Parallax ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 110, damping: 24, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 110, damping: 24, mass: 0.6 });

  // Deep backplate ("Portfolio") drifts subtly opposite to cursor
  const backplateX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const backplateY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Midground halftone & diagonal slash
  const midgroundX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const midgroundY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  // Centerpiece (Three.js sculpture or portrait cutout) follows cursor gently
  const centerpieceX = useTransform(smoothX, [-0.5, 0.5], [-22, 22]);
  const centerpieceY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isMotionActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(normX);
    mouseY.set(normY);
    pointerRef.current = { x: normX * 2, y: -normY * 2 };
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    pointerRef.current = { x: 0, y: 0 };
  };

  const handleToggleMotion = () => {
    setMotionEnabled((prev) => {
      const next = !prev;
      if (!next) {
        mouseX.set(0);
        mouseY.set(0);
        pointerRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  };

  const parsedMetrics = useMemo(
    () =>
      metrics.map((m) => ({
        ...m,
        ...parseMetricValue(m.value),
      })),
    [metrics]
  );

  // --- GSAP: Synchronized Edge-to-Edge Black Mustang Writing + Right-Side Counters ---
  useGSAP(
    () => {
      const SYNC_DURATION = 1.9;
      const SYNC_EASE = "power3.out";

      const setInstantFinalState = () => {
        gsap.set(".gsap-portfolio-clip", { attr: { width: 1180 } });
        gsap.set(".gsap-portfolio-char", { opacity: 1 });
        gsap.set(".gsap-brush-slash", { scaleX: 1 });
        parsedMetrics.forEach((m, idx) => {
          const el = metricRefs.current[idx];
          if (el) el.textContent = `${m.target}${m.suffix}`;
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!motionEnabled) {
          setInstantFinalState();
          return;
        }

        const tl = gsap.timeline({ delay: 0.12 });

        tl.fromTo(
          ".gsap-portfolio-clip",
          { attr: { width: 0 } },
          {
            attr: { width: 1180 },
            duration: SYNC_DURATION,
            ease: SYNC_EASE,
          },
          0
        );

        tl.fromTo(
          ".gsap-portfolio-char",
          { opacity: 0.12 },
          {
            opacity: 1,
            duration: SYNC_DURATION * 0.45,
            stagger: {
              each: (SYNC_DURATION * 0.55) / Math.max(backgroundWord.length, 1),
            },
            ease: "power2.out",
          },
          0
        );

        tl.fromTo(
          ".gsap-brush-slash",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: SYNC_DURATION,
            ease: SYNC_EASE,
          },
          0
        );

        parsedMetrics.forEach((m, idx) => {
          const counter = { val: 0 };
          const el = metricRefs.current[idx];
          if (el) el.textContent = `0${m.suffix}`;

          tl.to(
            counter,
            {
              val: m.target,
              duration: SYNC_DURATION,
              ease: SYNC_EASE,
              onUpdate: () => {
                const node = metricRefs.current[idx];
                if (node) {
                  node.textContent = `${Math.round(counter.val)}${m.suffix}`;
                }
              },
            },
            0
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        setInstantFinalState();
      });
    },
    {
      scope: heroRef,
      dependencies: [motionEnabled, backgroundWord, parsedMetrics],
    }
  );

  const handlePrimaryClick = () => {
    if (onPrimaryCtaClick) {
      onPrimaryCtaClick();
      return;
    }
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSecondaryClick = () => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick();
      return;
    }
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: theme.bg,
        color: theme.textPrimary,
      }}
      className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden transition-colors duration-300"
      >
      {/* Layer 0: Architectural Grid + Center Halftone Aura */}
      <div
        style={{
          backgroundImage: `radial-gradient(ellipse 68% 54% at 50% 56%, ${theme.spotlightRgba}, transparent 72%)`,
        }}
        className="pointer-events-none absolute inset-0"
        />
      <div
        style={{
          backgroundImage: `linear-gradient(to right, ${theme.gridLineRgba} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridLineRgba} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        className="pointer-events-none absolute inset-0"
        />
      <motion.div
        style={{
          backgroundImage: `radial-gradient(${theme.halftoneDotRgba} 2.2px, transparent 2.2px)`,
          backgroundSize: "11px 11px",
          x: midgroundX,
          y: midgroundY,
        }}
        className="pointer-events-none absolute bottom-12 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full [mask-image:radial-gradient(circle,#000_24%,transparent_72%)] sm:h-[440px] sm:w-[440px]"
        />

      {/* Layer 1 (z-10): Full-Width Black Mustang Backplate with Subtle Cursor Parallax */}
      <motion.div
        style={{ x: backplateX, y: backplateY }}
        className="pointer-events-none absolute inset-x-0 top-14 z-10 flex justify-center select-none sm:top-14"
        >
        <svg
          viewBox="0 0 1000 320"
          preserveAspectRatio="none"
          className="h-[68vh] w-[98vw] sm:h-[76vh]"
          >
          <defs>
            <linearGradient
              id={`mustangPosterGrad-${theme.id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
              >
              <stop
                offset="0%"
                stopColor={theme.accent}
                stopOpacity={Math.min(theme.posterStrokeOpacity * 2.2, 0.44)}
                />
              <stop
                offset="65%"
                stopColor={theme.accent}
                stopOpacity={theme.posterFillOpacity * 2.5}
                />
              <stop offset="100%" stopColor={theme.bg} stopOpacity={0.02} />
            </linearGradient>

            <clipPath id="portfolioWriteClip">
              <rect
                className="gsap-portfolio-clip"
                x="-80"
                y="-30"
                width="1180"
                height="380"
                transform="skewX(-12)"
                />
            </clipPath>
          </defs>

          <g clipPath="url(#portfolioWriteClip)">
            <text
              x="500"
              y="245"
              textAnchor="middle"
              textLength="990"
              lengthAdjust="spacingAndGlyphs"
              fill={`url(#mustangPosterGrad-${theme.id})`}
              stroke={theme.accent}
              strokeOpacity={theme.posterStrokeOpacity * 0.75}
              strokeWidth="0.9"
              style={{
                fontFamily:
                  "var(--font-mustang), var(--font-poster), sans-serif",
              }}
              className="text-[265px] font-normal"
              >
              {backgroundWord.split("").map((char, idx) => (
                <tspan key={idx} className="gsap-portfolio-char">
                  {char}
                </tspan>
              ))}
            </text>
          </g>
        </svg>
      </motion.div>

      {/* Diagonal Painterly Accent Slash */}
      <motion.div
        aria-hidden="true"
        style={{ x: midgroundX, y: midgroundY }}
        className="pointer-events-none absolute inset-x-[-6%] top-[46%] z-[15] -rotate-[4deg] sm:top-[45%]"
        >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="gsap-brush-slash h-14 w-full origin-left opacity-25 sm:h-20 lg:h-24"
          >
          <path
            d="M0 44 L180 34 L340 42 L580 28 L860 36 L1120 22 L1340 30 L1440 24 L1440 84 L1290 92 L1060 80 L840 94 L610 82 L380 96 L150 86 L0 98 Z"
            fill={theme.accent}
            />
          <path
            d="M40 26 L260 22 M640 18 L920 15 M1180 12 L1410 16 M80 104 L420 108 M960 102 L1320 98"
            stroke={theme.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            />
        </svg>
      </motion.div>

      {/* Layer 2 (z-20): Cursor-Reactive Three.js Centerpiece / Cutout */}
      <motion.div
        style={{ x: centerpieceX, y: centerpieceY }}
        className="pointer-events-none absolute inset-x-0 bottom-10 top-14 z-20 mx-auto flex w-[96vw] max-w-[780px] items-center justify-center"
        >
        {characterSrc ? (
          <img
            src={characterSrc}
            alt={name}
            className="max-h-[72vh] w-auto self-end object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.5)]"
            />
        ) : (
          <HeroWebGLCanvas
            accentColor={theme.accent}
            secondaryColor={theme.textPrimary}
            motionEnabled={isMotionActive}
            pointerRef={pointerRef}
            className="h-full w-full"
            />
        )}
      </motion.div>

      {/* Layer 3 (z-50): Minimal Editorial Top Navbar — FIXED so it stays global across all sections */}
      <header
        style={{
          backgroundColor: `${theme.bg}B3`,
          borderColor: theme.border,
        }}
        className="fixed left-1/2 top-0 z-50 flex w-[98vw] -translate-x-1/2 items-center justify-between border-b px-2 py-3 backdrop-blur-sm sm:px-3"
        >
        <motion.a
          href="#"
          initial={isMotionActive ? { y: -14, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group inline-flex items-center gap-3.5 focus:outline-none"
          >
          <span
            style={{
              backgroundColor: theme.accent,
              color: theme.accentContrast,
              fontFamily: "var(--font-poster), sans-serif",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 24% 100%, 0 76%)",
            }}
            className="inline-flex h-8 w-8 items-center justify-center text-base font-black tracking-tight transition-transform duration-150 group-hover:scale-105"
            >
            {brandBox}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.22em] sm:text-[13px]">
            {brandHandle}
          </span>
        </motion.a>

        <motion.div
          initial={isMotionActive ? { y: -14, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-6 lg:gap-9"
          >
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {navLinks.map((link) => (
        <a
          key={link.num}
          href={link.href}
          style={{ color: theme.textPrimary }}
          className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-150 hover:opacity-65"
          >
          <span style={{ color: theme.textMuted }} className="mr-2">
            {link.num}
          </span>
          {link.label}
        </a>
      ))}
          </nav>

          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Color theme"
            >
            {PORTFOLIO_THEMES.map((preset) => {
              const active = preset.id === theme.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTheme(preset)}
                  title={preset.name}
                  aria-label={`Switch to ${preset.name}`}
                  style={{
                    borderColor: active ? theme.textPrimary : "transparent",
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-150 hover:scale-110 focus:outline-none"
                  >
                  <span
                    style={{ backgroundColor: preset.accent }}
                    className="h-3 w-3 rounded-full"
                    />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleToggleMotion}
            style={{ color: theme.textPrimary }}
            className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-150 hover:opacity-70 focus:outline-none"
            >
            <span
              style={{
                backgroundColor: isMotionActive
                  ? theme.accent
                  : theme.textMuted,
              }}
              className="h-2 w-2 rounded-full"
              />
            <span>{isMotionActive ? "MOTION ON" : "MOTION OFF"}</span>
          </button>

          {onSwitchToXpMode && (
        <button
          type="button"
          onClick={onSwitchToXpMode}
          style={{ color: theme.accent }}
          className="hidden font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity duration-150 hover:opacity-70 sm:inline-flex"
          >
          XP
        </button>
      )}
        </motion.div>
      </header>

      {/* Layer 4 (z-30): Edge-Aligned Left Editorial Identity & Specs + Right Metrics */}
      <div className="relative z-30 mx-auto mt-auto flex w-[98vw] flex-col justify-between gap-10 px-2 pb-24 pt-20 sm:px-3 lg:flex-row lg:items-end lg:pb-28">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <HandwrittenGreeting
              text={greeting}
              textColor={theme.textPrimary}
              accentColor={theme.accent}
              motionEnabled={isMotionActive}
              />
            <motion.span
              key={`${theme.id}-${isMotionActive}`}
              initial={isMotionActive ? { scale: 0.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: isMotionActive ? 1.32 : 0,
                type: "spring",
                stiffness: 420,
                damping: 22,
              }}
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.surfaceSubtle,
                color: theme.accent,
              }}
              className="inline-flex h-6 w-6 items-center justify-center border font-[family-name:var(--font-mono)] text-[10px] font-black tracking-tighter"
              >
              {initials}
            </motion.span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-poster), sans-serif",
              color: theme.textPrimary,
            }}
            className="mt-1 text-6xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-[82px]"
            >
            {/* Masked line: the name forms upward from the bottom on load */}
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={isMotionActive ? { y: "115%" } : false}
                animate={{ y: 0 }}
                transition={{ delay: 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                {name}
              </motion.span>
            </span>
          </h1>

          {/* Accent role line drops in from the top right after the name */}
          <span className="mt-2.5 block overflow-hidden">
            <motion.span
              style={{ color: theme.accent }}
              className="block font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.18em]"
              initial={isMotionActive ? { y: "-120%", opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
              {roleLine}
            </motion.span>
          </span>

          {/* Serif statement reveals from the top after the role line settles */}
          <span className="mt-4 block max-w-[360px] overflow-hidden font-[family-name:var(--font-serif)] text-[26px] leading-[1.12] tracking-tight sm:text-[31px]">
            <motion.span
              style={{ color: theme.textPrimary }}
              className="block"
              initial={isMotionActive ? { y: "-115%" } : false}
              animate={{ y: 0 }}
              transition={{ delay: 0.72, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
              {serifLead}{" "}
              <em style={{ color: theme.accent }} className="italic">
                {serifEmphasis}
              </em>
            </motion.span>
          </span>

          {/* Buttons rise in last */}
          <motion.div
            initial={isMotionActive ? { y: 26, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8"
            >
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handlePrimaryClick}
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentContrast,
                  clipPath:
                    "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
                }}
                className="inline-flex h-11 w-[220px] items-center justify-between pl-5 pr-7 font-[family-name:var(--font-mono)] text-[10.5px] font-extrabold uppercase tracking-[0.18em] transition duration-150 hover:opacity-90 active:scale-[0.99]"
                >
                <span>{primaryCtaText}</span>
                <span aria-hidden="true" className="inline-flex items-center">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
              </button>

              <button
                type="button"
                onClick={handleSecondaryClick}
                style={{
                  borderColor: theme.borderStrong,
                  color: theme.textPrimary,
                  backgroundColor: theme.surfaceSubtle,
                }}
                className="inline-flex h-11 w-[206px] items-center justify-center border px-5 font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.18em] transition duration-150 hover:opacity-80"
                >
                {secondaryCtaText}
              </button>
            </div>

            <div className="grid grid-cols-[58px_minmax(0,255px)] gap-x-4 gap-y-2 font-[family-name:var(--font-mono)] text-[11px] leading-[1.45]">
              {specRows.map((row) => (
        <div key={row.label} className="contents">
          <span
            style={{ color: theme.textMuted }}
            className="font-semibold uppercase tracking-[0.12em]"
            >
            {row.label}
          </span>
          <span
            style={{
              color: row.highlight ? theme.accent : theme.textPrimary,
            }}
            className="font-medium"
            >
            {row.highlight ? (
              <span className="inline-flex items-center gap-2">
                <span
                  style={{ backgroundColor: theme.accent }}
                  className="h-2 w-2 shrink-0 rounded-full"
                  />
                <span>{row.value}</span>
              </span>
            ) : (
              row.value
            )}
          </span>
        </div>
      ))}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-row flex-wrap gap-6 sm:gap-8 lg:flex-col lg:items-end lg:gap-4">
          {parsedMetrics.map((metric, idx) => (
        <div key={idx} className="flex items-center gap-3 lg:justify-end">
          <span
            ref={(el) => {
              metricRefs.current[idx] = el;
            }}
            style={{
              fontFamily: "var(--font-poster), sans-serif",
              color: theme.accent,
            }}
            className="min-w-[84px] text-right text-4xl font-black tabular-nums leading-none sm:min-w-[104px] sm:text-5xl"
            >
            {metric.value}
          </span>
          <span
            style={{ color: theme.textSecondary }}
            className="w-[88px] font-[family-name:var(--font-mono)] text-[9.5px] font-semibold uppercase leading-tight tracking-[0.14em]"
            >
            {metric.label}
          </span>
        </div>
      ))}
        </div>
      </div>
    </section>
  );
}
