// src/constants/theme.ts

export interface DuotoneTheme {
  id: string;
  name: string;
  accentHexLabel: string;
  bgHexLabel: string;
  /** Primary dark canvas background */
  bg: string;
  /** Elevated panel / subtle dark surface */
  surface: string;
  /** Translucent tint for pills and secondary buttons */
  surfaceSubtle: string;
  /** High-contrast primary foreground text */
  textPrimary: string;
  /** Secondary supporting copy */
  textSecondary: string;
  /** Muted labels and index markers */
  textMuted: string;
  /** Primary duotone electric accent */
  accent: string;
  /** High-contrast dark ink rendered on top of solid accent fills */
  accentContrast: string;
  /** Subtle structural hairline border */
  border: string;
  /** Strong border for active controls and buttons */
  borderStrong: string;
  /** Architectural grid line color */
  gridLineRgba: string;
  /** Radial ambient spotlight behind centerpiece */
  spotlightRgba: string;
  /** Halftone dot matrix fill */
  halftoneDotRgba: string;
  /** Giant background PORTFOLIO wordmark fill & stroke */
  posterFillOpacity: number;
  posterStrokeOpacity: number;
  /** Black Mustang backplate wordmark: overall opacity + vertical gradient colors */
  posterWordOpacity: number;
  posterWordTop: string;
  posterWordBottom: string;
  /** Shodo brush-stroke ink gradient (accent fade into bg) */
  shodoStart: string;
  shodoStartOpacity: number;
  shodoMid: string;
  shodoMidOpacity: number;
}

/** 1. Dark Grey (#0E0E0B) + Lime Green (#AFE607) */
export const DARK_LIME_THEME: DuotoneTheme = {
  id: "dark-lime",
  name: "Dark Grey & Lime Green",
  accentHexLabel: "#AFE607",
  bgHexLabel: "#0E0E0B",
  bg: "#0E0E0B",
  surface: "#161612",
  surfaceSubtle: "rgba(175, 230, 7, 0.06)",
  textPrimary: "#F4F6EE",
  textSecondary: "#C5C9BA",
  textMuted: "#7E8373",
  accent: "#AFE607",
  accentContrast: "#0E0E0B",
  border: "rgba(175, 230, 7, 0.16)",
  borderStrong: "rgba(175, 230, 7, 0.48)",
  gridLineRgba: "rgba(175, 230, 7, 0.045)",
  spotlightRgba: "rgba(175, 230, 7, 0.16)",
  halftoneDotRgba: "rgba(175, 230, 7, 0.34)",
  posterFillOpacity: 0.055,
  posterStrokeOpacity: 0.16,
  posterWordOpacity: 0.14,
  posterWordTop: "#AFE607",
  posterWordBottom: "#0E0E0B",
  shodoStart: "#AFE607",
  shodoStartOpacity: 0.5,
  shodoMid: "#AFE607",
  shodoMidOpacity: 0.18,
};

/** 2. Almost Black (#070D0D) + Blaze Orange (#FF6700) */
export const BLACK_BLAZE_THEME: DuotoneTheme = {
  id: "black-blaze",
  name: "Almost Black & Blaze Orange",
  accentHexLabel: "#FF6700",
  bgHexLabel: "#070D0D",
  bg: "#070D0D",
  surface: "#101717",
  surfaceSubtle: "rgba(255, 103, 0, 0.07)",
  textPrimary: "#F5F3F0",
  textSecondary: "#C9C3BC",
  textMuted: "#827B74",
  accent: "#FF6700",
  accentContrast: "#070D0D",
  border: "rgba(255, 103, 0, 0.18)",
  borderStrong: "rgba(255, 103, 0, 0.5)",
  gridLineRgba: "rgba(255, 103, 0, 0.045)",
  spotlightRgba: "rgba(255, 103, 0, 0.18)",
  halftoneDotRgba: "rgba(255, 103, 0, 0.36)",
  posterFillOpacity: 0.06,
  posterStrokeOpacity: 0.18,
  posterWordOpacity: 0.14,
  posterWordTop: "#FF6700",
  posterWordBottom: "#070D0D",
  shodoStart: "#FF6700",
  shodoStartOpacity: 0.5,
  shodoMid: "#FF6700",
  shodoMidOpacity: 0.18,
};

/** 3. Blue Oxford (#0E0929) + Vista Blue (#92ACFF) */
export const OXFORD_VISTA_THEME: DuotoneTheme = {
  id: "oxford-vista",
  name: "Blue Oxford & Vista Blue",
  accentHexLabel: "#92ACFF",
  bgHexLabel: "#0E0929",
  bg: "#0E0929",
  surface: "#16103B",
  surfaceSubtle: "rgba(146, 172, 255, 0.07)",
  textPrimary: "#EEF2FF",
  textSecondary: "#BCC7EC",
  textMuted: "#7481B0",
  accent: "#92ACFF",
  accentContrast: "#0E0929",
  border: "rgba(146, 172, 255, 0.18)",
  borderStrong: "rgba(146, 172, 255, 0.5)",
  gridLineRgba: "rgba(146, 172, 255, 0.05)",
  spotlightRgba: "rgba(146, 172, 255, 0.2)",
  halftoneDotRgba: "rgba(146, 172, 255, 0.36)",
  posterFillOpacity: 0.065,
  posterStrokeOpacity: 0.18,
  posterWordOpacity: 0.14,
  posterWordTop: "#92ACFF",
  posterWordBottom: "#0E0929",
  shodoStart: "#92ACFF",
  shodoStartOpacity: 0.5,
  shodoMid: "#92ACFF",
  shodoMidOpacity: 0.18,
};

/** 4. Rich Black (#010B13) + Powder White (#EBF1F5) */
export const BLACK_POWDER_THEME: DuotoneTheme = {
  id: "black-powder",
  name: "Rich Black & Powder White",
  accentHexLabel: "#EBF1F5",
  bgHexLabel: "#010B13",
  bg: "#010B13",
  surface: "#081521",
  surfaceSubtle: "rgba(235, 241, 245, 0.06)",
  textPrimary: "#EBF1F5",
  textSecondary: "#B4C2CC",
  textMuted: "#6C7D8A",
  accent: "#EBF1F5",
  accentContrast: "#010B13",
  border: "rgba(235, 241, 245, 0.16)",
  borderStrong: "rgba(235, 241, 245, 0.48)",
  gridLineRgba: "rgba(235, 241, 245, 0.04)",
  spotlightRgba: "rgba(235, 241, 245, 0.14)",
  halftoneDotRgba: "rgba(235, 241, 245, 0.3)",
  posterFillOpacity: 0.055,
  posterStrokeOpacity: 0.16,
  posterWordOpacity: 0.14,
  posterWordTop: "#EBF1F5",
  posterWordBottom: "#010B13",
  shodoStart: "#EBF1F5",
  shodoStartOpacity: 0.5,
  shodoMid: "#EBF1F5",
  shodoMidOpacity: 0.18,
};

export const PORTFOLIO_THEMES: readonly DuotoneTheme[] = [
  DARK_LIME_THEME,
  BLACK_BLAZE_THEME,
  OXFORD_VISTA_THEME,
  BLACK_POWDER_THEME,
];

export const ACTIVE_THEME: DuotoneTheme = DARK_LIME_THEME;
