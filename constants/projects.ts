// src/constants/projects.ts

export type ProjectCardVariant =
  | "accent-poster"
  | "obsidian-hud"
  | "spotlight-core"
  | "split-editorial";

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  stackSummary: string;
  featured: boolean;
  variant: ProjectCardVariant;
  /** Cover images (first is used unless coverIndex says otherwise) */
  coverImages?: readonly string[];
  /** Which cover image to show — 1-based; defaults to 1 */
  coverIndex?: number;
  /** Optional demo video path inside /public/videos/ */
  demoVideo?: string;
  /** Preview badge & watermark shown when no cover images are set */
  watermark: string;
  highlightMetric: string;
  /** Extended fields ready for the project detail modal/view */
  year: string;
  role: string;
  tagline: string;
  overview: string;
  techStack: readonly string[];
  architectureHighlights: readonly string[];
  repoUrl?: string;
  liveUrl?: string;
  /** "in-progress" renders a yellow IN PROGRESS badge on the card & modal; omit for shipped projects */
  status?: "live" | "in-progress";
}

export const PROJECTS_SECTION_CONFIG = {
  sectionTitle: "SELECTED PROJECTS",
} as const;

export const PROJECTS_LIST: readonly ProjectItem[] = [
  {
    id: "fairway-club",
    index: "01",
    title: "Fairway Club",
    category: "Golf Society & Club Platform",
    stackSummary: "Full-Stack Web · Mobile · Booking",
    featured: true,
    variant: "accent-poster",
    coverImages: ["/fairwayClub.png"],
    watermark: "FAIRWAY",
    highlightMetric: "Tee-Time Scheduling · Live Scoring",
    year: "2026",
    role: "Full-Stack Developer",
    liveUrl: "https://the-fairway-club-theta.vercel.app/",
    repoUrl: "https://github.com/yash-mishra150/the-fairway-club.git",
    tagline:
      "Private club and golf society platform for tee-time reservations, live match scoring, and member coordination.",
    overview:
      "Built to streamline private golf group operations with real-time tee-sheet booking, tournament leaderboards, member credit balances, and group round scheduling.",
    techStack: [
      "React Native",
      "Next.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
    ],
    architectureHighlights: [
      "Real-time tee-time slot allocation and foursome group coordination",
      "Live tournament scoring with automated leaderboard and handicap standings",
      "Member wallet tracking, club notices, and event scheduling workflows",
    ],
  },
  {
    id: "deckgate",
    index: "02",
    title: "DeckGate",
    category: "Token-Compressed AI Coding CLI",
    stackSummary: "Node.js · Express · OpenCode",
    featured: true,
    status: "in-progress",
    variant: "obsidian-hud",
    coverImages: ["/Deckgate.png"],
    watermark: "DECKGATE",
    highlightMetric: "Headroom-AI Compression · Live DAG UI",
    year: "2026",
    role: "Creator & Open-Source Author",
    tagline:
      "Node.js CLI and local Express dashboard combining headroom-ai token compression with OpenCode runs.",
    overview:
      "Orchestrates multi-step AI coding sessions over OpenRouter while compressing repository context locally via headroom-ai and streaming live node execution telemetry.",
    techStack: [
      "Node.js",
      "Express",
      "OpenCode",
      "OpenRouter",
      "Headroom-AI",
    ],
    architectureHighlights: [
      "Local context compression pipeline reducing prompt token overhead before inference",
      "Progressive node-by-node execution DAG and live status viewer in Express",
      "Seamless multi-model routing through OpenRouter for fast coding iterations",
    ],
  },
  {
    id: "mitmforge",
    index: "03",
    title: "MitmForge",
    category: "Network Traffic Interception Proxy",
    stackSummary: "Tauri · Rust · React · TypeScript",
    featured: true,
    variant: "spotlight-core",
    coverImages: ["/MitmForge.png", "/MitmForgeDashboard.png"],
    coverIndex: 2,
    watermark: "MITMFORGE",
    highlightMetric: "Native TLS Proxy · Zero Electron Bloat",
    repoUrl: "https://github.com/yash-mishra150/mitmforge.git",
    liveUrl: "https://github.com/yash-mishra150/mitmforge/releases",
    year: "2026",
    role: "Creator & Systems Developer",
    tagline:
      "Native desktop HTTP/HTTPS debugging proxy built with Rust, Tauri, and React.",
    overview:
      "A lightweight native alternative to Proxyman powered by Rust's hudsucker proxy engine and type-safe tauri-specta IPC bindings for real-time packet inspection.",
    techStack: [
      "Rust",
      "Tauri",
      "Hudsucker",
      "React",
      "TypeScript",
      "Zustand",
      "Tailwind CSS",
    ],
    architectureHighlights: [
      "High-throughput TLS/HTTP interception in Rust with minimal memory overhead",
      "End-to-end typed Rust-to-React command bridge via tauri-specta",
      "Live request/response waterfall inspector with header and payload filtering",
    ],
  },
  {
    id: "olist-intelligence",
    index: "04",
    title: "Olist Commerce Intelligence",
    category: "Revenue & Operations Analytics",
    stackSummary: "MySQL · Power BI · SQL Modeling",
    featured: true,
    variant: "split-editorial",
    coverImages: ["/Oilest_Image.png"],
//    demoVideo: "/Hardware_demo.mp4",
    watermark: "OLIST BI",
    highlightMetric: "20 Analytical SQL Queries · Executive BI",
    year: "2026",
    role: "Data & BI Engineer",
    tagline:
      "End-to-end e-commerce revenue, seller SLA, and customer retention intelligence system.",
    overview:
      "Modeled multi-table transactional marketplace data in MySQL across 20 business SQL queries feeding an interactive Power BI executive dashboard.",
    techStack: ["MySQL", "Power BI", "DAX", "Relational Modeling"],
    architectureHighlights: [
      "20 production SQL queries covering cohort retention, freight ratios, and seller SLAs",
      "Normalized olist_ecommerce_analytics schema tuned for fast analytical aggregations",
      "Interactive Power BI executive report with drill-down revenue and regional KPIs",
    ],
  },
  {
    id: "smart-plant-automation",
    index: "05",
    title: "Smart Plant Automation",
    category: "IoT Hardware Prototype & Research",
    stackSummary: "Arduino · C++ · Embedded Sensors",
    featured: false,
    variant: "accent-poster",
    coverImages: ["/SmartPlant.png"],
    demoVideo: "/Hardware_demo.mp4",
    watermark: "IOT PLANT",
    highlightMetric: "Hardware Demo · International Paper Submissions",
    year: "2025",
    role: "Embedded & IoT Developer",
    tagline:
      "Arduino-based IoT monitoring and automated irrigation system backed by a working hardware prototype and international conference paper submissions.",
    overview:
      "Engineered a microcontroller-driven smart plant monitoring and closed-loop irrigation prototype, documented in a technical research paper submitted across multiple international conferences.",
    techStack: ["Arduino", "C++", "IoT Telemetry", "Sensor Calibration"],
    architectureHighlights: [
      "Real-time soil moisture, temperature, and humidity acquisition loop with analog noise filtering",
      "Threshold-driven closed-loop relay actuation demonstrated on physical hardware",
      "Technical research manuscript submitted to multiple international engineering conferences",
    ],
  },
];
