// src/components/SelectProject.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Circle,
} from "lucide-react";
import {
  ACTIVE_THEME,
  PROJECTS_LIST,
  PROJECTS_SECTION_CONFIG,
  type DuotoneTheme,
  type ProjectItem,
} from "@/constants";

/** Cover images resolve by 1-based coverIndex; default 1 = first image */
const resolveCover = (project: ProjectItem): string | undefined =>
  project.coverImages?.[(project.coverIndex ?? 1) - 1];

export interface SelectProjectProps {
  theme?: DuotoneTheme;
  sectionTitle?: string;
  projects?: readonly ProjectItem[];
  onSelectProject?: (project: ProjectItem | null) => void;
}

export function SelectProject({
  theme = ACTIVE_THEME,
  sectionTitle = PROJECTS_SECTION_CONFIG.sectionTitle,
  projects = PROJECTS_LIST,
  onSelectProject,
}: SelectProjectProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [slide, setSlide] = useState(0);

  // Rail dot navigation
  const railRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const handleRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(rail.children).forEach((card, i) => {
      const el = card as HTMLElement;
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActiveDot(best);
  };

  const scrollToProject = (i: number) => {
    const rail = railRef.current;
    const card = rail?.children[i] as HTMLElement | undefined;
    if (rail && card) {
      // Smooth glide handled by anime.js tweening the container's scrollLeft
      anime({
        targets: rail,
        scrollLeft: card.offsetLeft - rail.offsetLeft,
        duration: prefersReducedMotion ? 0 : 900,
        easing: "easeInOutQuad",
      });
    }
  };

  // Slow autoplay: dots keep advancing forever; pauses on hover or modal open
  const [railPaused, setRailPaused] = useState(false);

  useEffect(() => {
    if (railPaused || prefersReducedMotion || activeProject) return;
    const id = window.setInterval(() => {
      setActiveDot((prev) => {
        const next = (prev + 1) % projects.length;
        scrollToProject(next);
        return next;
      });
    }, 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scrollToProject closes over stable refs/config only
  }, [railPaused, prefersReducedMotion, activeProject, projects.length]);

  const openProject = (project: ProjectItem) => {
    setActiveProject(project);
    setSlide(0); // carousel always starts at the first image
    onSelectProject?.(project);
  };

  const closeProject = () => {
    setActiveProject(null);
    onSelectProject?.(null);
  };

  const currentIndex = activeProject
    ? projects.findIndex((item) => item.id === activeProject.id)
    : -1;

  const prevProject =
    currentIndex >= 0 && projects.length > 1
    ? projects[(currentIndex - 1 + projects.length) % projects.length]
    : null;

  const nextProject =
    currentIndex >= 0 && projects.length > 1
    ? projects[(currentIndex + 1) % projects.length]
    : null;

  // Lock background scroll & enable Escape / ArrowLeft / ArrowRight navigation
  useEffect(() => {
    if (!activeProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeProject();
      } else if (e.key === "ArrowLeft" && prevProject) {
        openProject(prevProject);
      } else if (e.key === "ArrowRight" && nextProject) {
        openProject(nextProject);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject, prevProject, nextProject]);

  return (
    <>
      {/* PART 1: SELECTED PROJECTS GRID SECTION */}
      <section
        id="projects"
        style={{
          backgroundColor: theme.bg,
          color: theme.textPrimary,
        }}
        className="relative w-full pt-24 pb-20 transition-colors duration-300 sm:pt-28 sm:pb-28"
        >
        <div
          style={{
            backgroundImage: `radial-gradient(ellipse 65% 45% at 50% 0%, ${theme.spotlightRgba}, transparent 72%)`,
          }}
          className="pointer-events-none absolute inset-0"
          />

        <div className="relative z-10 mx-auto w-[98vw] px-2 sm:px-3">
          {/* Header Row + View More Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentContrast,
                }}
                className="inline-flex h-6 items-center justify-center px-2 font-[family-name:var(--font-mono)] text-[10px] font-extrabold tracking-[0.16em]"
                >
                02
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-poster), sans-serif",
                  color: theme.textPrimary,
                }}
                className="text-3xl font-black uppercase tracking-[0.04em] sm:text-4xl"
                >
                {sectionTitle}
              </h2>
            </div>
          </div>

          {/* Horizontal Scroll Project Rail (native scrollbar hidden — dots below navigate) */}
          <div
            ref={railRef}
            onScroll={handleRailScroll}
            onMouseEnter={() => setRailPaused(true)}
            onMouseLeave={() => setRailPaused(false)}
            onFocus={() => setRailPaused(true)}
            onBlur={() => setRailPaused(false)}
            className="relative mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
            {projects.map((project, idx) => (
          <motion.article
            key={project.id}
            className="relative w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-6rem)/5)]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.42,
              delay: (idx % 4) * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            >
            <button
              type="button"
              onClick={() => openProject(project)}
              className="group flex w-full cursor-pointer flex-col text-left focus:outline-none"
              >
              <div
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border transition-colors duration-300"
                >
                {resolveCover(project) ? (
                  <img
                    src={resolveCover(project)}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                ) : project.demoVideo ? (
                  <video
                    src={project.demoVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${project.title} demo video cover`}
                    className="h-full w-full object-cover"
                    />
                ) : (
                  <div
                    style={{
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                    }}
                    className="flex h-full w-full items-center justify-center border font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.16em]"
                    >
                    <span style={{ color: theme.textMuted }}>
                      {project.watermark}
                    </span>
                  </div>
                )}

                <div
                  style={{ borderColor: theme.accent }}
                  className="pointer-events-none absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity duration-200 group-hover:opacity-65"
                  />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3 px-0.5">
                <div className="min-w-0">
                  <h3
                    style={{ color: theme.textPrimary }}
                    className="truncate text-lg font-bold tracking-tight transition-opacity duration-150 group-hover:opacity-85 sm:text-[19px]"
                    >
                    {project.title}
                  </h3>
                  <p
                    style={{ color: theme.textMuted }}
                    className="mt-1 truncate text-xs leading-snug"
                    >
                    {project.category}
                  </p>
                  <p
                    style={{ color: theme.textMuted }}
                    className="truncate font-[family-name:var(--font-mono)] text-[10.5px] leading-snug opacity-85"
                    >
                    {project.stackSummary}
                  </p>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-poster), sans-serif",
                    color: theme.accent,
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 text-2xl font-black leading-none tracking-tight sm:text-[26px]"
                  >
                  <span>{project.index}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                    <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                </span>
              </div>
            </button>

            {/* Chip: yellow IN PROGRESS wins; otherwise a LIVE link opens the deployment in a new tab */}
            {project.status === "in-progress" ? (
              <span
                aria-label={`${project.title} is in progress`}
                style={{ backgroundColor: "#FFD400", color: "#141400" }}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[9.5px] font-extrabold uppercase tracking-[0.14em]"
                >
                <span
                  style={{ backgroundColor: "#141400" }}
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  aria-hidden="true"
                  />
                IN PROGRESS
              </span>
            ) : project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Open live deployment of ${project.title} in a new tab`}
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentContrast,
                }}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[9.5px] font-extrabold uppercase tracking-[0.14em] transition hover:opacity-85"
                >
                LIVE
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.75} />
              </a>
            ) : null}
          </motion.article>
        ))}
          </div>

          {/* Dot indicators: one per project, click to jump */}
          <div className="mt-1 flex items-center justify-center gap-2">
            {projects.map((project, i) => (
              <button
                key={project.id}
                type="button"
                onClick={() => scrollToProject(i)}
                aria-label={`Go to project ${project.title}`}
                style={{ backgroundColor: i === activeDot ? theme.accent : theme.border }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeDot ? "w-7" : "w-1.5 hover:opacity-70"
                }`}
                />
            ))}
          </div>
        </div>
      </section>

      {/* PART 2: PROJECT DESCRIPTION MODAL (OPENS WHEN ANY CARD IS CLICKED) */}
      <AnimatePresence>
        {activeProject && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-project-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onClick={closeProject}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

        <motion.div
          key={activeProject.id}
          initial={
            prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 24, scale: 0.985 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 16, scale: 0.985 }
          }
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: theme.bg,
            color: theme.textPrimary,
            borderColor: theme.borderStrong,
          }}
          className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
          >
          <div
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.gridLineRgba} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridLineRgba} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
            className="pointer-events-none absolute inset-0"
            />

          {/* Top Bar */}
          <div
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            className="relative z-20 flex items-center justify-between border-b px-5 py-3.5 sm:px-8"
            >
            <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.18em]">
              <span
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentContrast,
                }}
                className="inline-flex h-6 items-center px-2 font-extrabold"
                >
                PROJECT {activeProject.index}
              </span>
              <span style={{ color: theme.textSecondary }}>
                {activeProject.category}
              </span>
              <span style={{ color: theme.textMuted }}>
                · {activeProject.year}
              </span>
            </div>

            <button
              type="button"
              onClick={closeProject}
              style={{
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
                backgroundColor: theme.surfaceSubtle,
              }}
              className="inline-flex items-center gap-2 border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.16em] transition duration-150 hover:opacity-80"
              >
              <span>CLOSE</span>
              <span style={{ color: theme.accent }}>[ESC]</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            <div className="relative">
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-poster), sans-serif",
                  color: theme.accent,
                  opacity: 0.08,
                }}
                className="pointer-events-none absolute -top-4 right-0 select-none text-7xl font-black uppercase leading-none tracking-tight sm:text-8xl"
                >
                {activeProject.watermark}
              </span>

              <p
                style={{ color: theme.accent }}
                className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.18em]"
                >
                {activeProject.role}
              </p>

              <h2
                id="select-project-title"
                style={{
                  fontFamily: "var(--font-poster), sans-serif",
                  color: theme.textPrimary,
                }}
                className="mt-1 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl"
                >
                {activeProject.title}
              </h2>

              {activeProject.status === "in-progress" && (
                <span
                  style={{ backgroundColor: "#FFD400", color: "#141400" }}
                  className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-extrabold uppercase tracking-[0.16em]"
                  >
                  <span
                    style={{ backgroundColor: "#141400" }}
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    aria-hidden="true"
                    />
                  IN PROGRESS
                </span>
              )}

              <p
                style={{ color: theme.textPrimary }}
                className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-2xl leading-snug sm:text-[26px]"
                >
                {activeProject.tagline}
              </p>
            </div>

            {/* Media Stage (Demo Video / Screenshot / Highlight Banner) */}
            <div
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
              className="mt-6 overflow-hidden rounded-xl border"
              >
              {activeProject.demoVideo ? (
                <div className="relative aspect-video w-full bg-black">
                  <div
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentContrast,
                    }}
                    className="absolute left-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
                    >
                    <Circle
                      className="h-2 w-2 animate-pulse"
                      fill="currentColor"
                      strokeWidth={0}
                      aria-hidden="true"
                      />
                    HARDWARE DEMO VIDEO
                  </div>
                  <video
                    src={activeProject.demoVideo}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                    />
                </div>
              ) : (activeProject.coverImages?.length ?? 0) > 0 ? (
                <div className="relative aspect-video w-full overflow-hidden">
                  <motion.img
                    key={slide}
                    src={activeProject.coverImages![slide]}
                    alt={`${activeProject.title} screenshot ${slide + 1}`}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 h-full w-full object-cover"
                    />

                  {activeProject.coverImages!.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSlide(
                            (s) =>
                              (s - 1 + activeProject.coverImages!.length) %
                              activeProject.coverImages!.length
                          )
                        }
                        aria-label="Previous screenshot"
                        style={{ backgroundColor: theme.bg, color: theme.textPrimary, borderColor: theme.border }}
                        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border transition hover:opacity-80"
                        >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlide((s) => (s + 1) % activeProject.coverImages!.length)}
                        aria-label="Next screenshot"
                        style={{ backgroundColor: theme.bg, color: theme.textPrimary, borderColor: theme.border }}
                        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border transition hover:opacity-80"
                        >
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                        {activeProject.coverImages!.map((src, i) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => setSlide(i)}
                            aria-label={`Go to screenshot ${i + 1}`}
                            style={{ backgroundColor: i === slide ? theme.accent : theme.border }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === slide ? "w-6" : "w-1.5 hover:opacity-70"
                            }`}
                            />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    backgroundImage: `radial-gradient(circle at 80% 20%, ${theme.spotlightRgba}, transparent 68%)`,
                  }}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
                  >
                  <div>
                    <span
                      style={{ color: theme.textMuted }}
                      className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.18em]"
                      >
                      KEY HIGHLIGHT
                    </span>
                    <p
                      style={{ color: theme.accent }}
                      className="mt-1 font-[family-name:var(--font-mono)] text-sm font-bold uppercase tracking-[0.12em] sm:text-base"
                      >
                      {activeProject.highlightMetric}
                    </p>
                  </div>

                  <div
                    style={{
                      borderColor: theme.borderStrong,
                      backgroundColor: theme.bg,
                      color: theme.textPrimary,
                    }}
                    className="inline-flex shrink-0 items-center gap-2 border px-3.5 py-2 font-[family-name:var(--font-mono)] text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                    >
                    <span
                      style={{ backgroundColor: theme.accent }}
                      className="h-2 w-2 rounded-full"
                      />
                    <span>{activeProject.stackSummary}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3
                  style={{ color: theme.textMuted }}
                  className="font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.2em]"
                  >
                  01 // OVERVIEW
                </h3>
                <p
                  style={{ color: theme.textSecondary }}
                  className="mt-2.5 text-sm leading-relaxed sm:text-[15px]"
                  >
                  {activeProject.overview}
                </p>

                <h3
                  style={{ color: theme.textMuted }}
                  className="mt-6 font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.2em]"
                  >
                  02 // ARCHITECTURE & IMPLEMENTATION
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {activeProject.architectureHighlights.map(
            (point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm leading-relaxed"
                >
                <span
                  style={{ color: theme.accent }}
                  className="mt-0.5 font-[family-name:var(--font-mono)] text-xs font-extrabold"
                  >
                  0{idx + 1}
                </span>
                <span style={{ color: theme.textPrimary }}>
                  {point}
                </span>
              </li>
            )
          )}
                </ul>
              </div>

              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                <div
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSubtle,
                  }}
                  className="rounded-xl border p-4 sm:p-5"
                  >
                  <h3
                    style={{ color: theme.textMuted }}
                    className="font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.2em]"
                    >
                    03 // TECH STACK
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeProject.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        borderColor: theme.borderStrong,
                        backgroundColor: theme.bg,
                        color: theme.textPrimary,
                      }}
                      className="border px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                      >
                      {tech}
                    </span>
                  ))}
                  </div>

                  {(activeProject.liveUrl || activeProject.repoUrl) && (
                    <div className="mt-5 flex flex-col gap-2.5">
                      {activeProject.liveUrl && (
                      <a
                        href={activeProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: theme.accent,
                          color: theme.accentContrast,
                        }}
                        className="inline-flex items-center justify-between px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-extrabold uppercase tracking-[0.16em] transition duration-150 hover:opacity-90"
                        >
                        <span>LIVE DEPLOYMENT</span>
                        <span aria-hidden="true" className="inline-flex items-center">
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      </a>
                    )}
                      {activeProject.repoUrl && (
                      <a
                        href={activeProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          borderColor: theme.borderStrong,
                          color: theme.textPrimary,
                        }}
                        className="inline-flex items-center justify-between border px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.16em] transition duration-150 hover:opacity-80"
                        >
                        <span>SOURCE REPOSITORY</span>
                        <span aria-hidden="true" className="inline-flex items-center">
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      </a>
                    )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Prev / Next Bar */}
          {prevProject && nextProject && (
            <div
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
              className="relative z-20 flex items-center justify-between border-t px-5 py-3.5 sm:px-8"
              >
              <button
                type="button"
                onClick={() => openProject(prevProject)}
                style={{ color: theme.textSecondary }}
                className="group inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                >
                <span
                  style={{ color: theme.accent }}
                  className="inline-flex transition-transform group-hover:-translate-x-0.5"
                  >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span>
                  {prevProject.index} {prevProject.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openProject(nextProject)}
                style={{ color: theme.textSecondary }}
                className="group inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                >
                <span>
                  {nextProject.index} {nextProject.title}
                </span>
                <span
                  style={{ color: theme.accent }}
                  className="inline-flex transition-transform group-hover:translate-x-0.5"
                  >
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )}
      </AnimatePresence>
    </>
  );
}

/** Alias export in case any file imports SelectedProjectsSection */
export const SelectedProjectsSection = SelectProject;
