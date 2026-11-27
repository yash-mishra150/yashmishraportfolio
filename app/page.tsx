// src/app/page.tsx
"use client";

import { useState, type CSSProperties } from "react";
import { ACTIVE_THEME, type DuotoneTheme } from "@/constants";
import { CustomCursor } from "@/components/CustomCursor";
import { HeroSection } from "@/components/HeroSection";
import { CrossedMarqueeTape } from "@/components/CrossedMarqueeTape";
import { SelectProject } from "@/components/SelectProject";

export default function HomePage() {
  const [theme, setTheme] = useState<DuotoneTheme>(ACTIVE_THEME);

  return (
    <main
      style={
        {
          backgroundColor: theme.bg,
          color: theme.textPrimary,
          // ::selection + theme-aware CSS pick these up globally (globals.css)
          "--theme-bg": theme.bg,
          "--theme-accent": theme.accent,
          "--theme-accent-contrast": theme.accentContrast,
        } as CSSProperties
      }
      className="min-h-screen transition-colors duration-300"
      >
      <CustomCursor theme={theme} />
      <HeroSection theme={theme} onThemeChange={setTheme} />
      {/* Tilted tape straddles the hero → projects seam, masking the hard corner */}
      <CrossedMarqueeTape theme={theme} className="relative z-40 -my-16 sm:-my-24" />
      <SelectProject theme={theme} />
    </main>
  );
}
