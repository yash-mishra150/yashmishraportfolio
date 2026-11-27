// src/constants/hero.ts

export interface MetricItem {
  value: string;
  label: string;
}

export interface NavLinkItem {
  num: string;
  label: string;
  href: string;
}

export interface SpecRowItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export const HERO_CONFIG = {
  brandBox: "YM",
  brandHandle: "YASHMISHRA",
  backgroundWord: "Portfolio",
  greeting: "Hello, I'm",
  name: "YASH MISHRA",
  initials: "YM",
  roleLine: "FULL-STACK & AI ENGINEER",
  serifLead: "From resilient backends to fluid interfaces,",
  serifEmphasis: "engineered to scale.",
  primaryCtaText: "VIEW THE WORK",
  secondaryCtaText: "START A PROJECT",
  /** Optional transparent portrait or anime cutout PNG inside /public/images/ */
  characterSrc: "",
  navLinks: [
    { num: "02", label: "WORK", href: "#projects" },
    { num: "03", label: "STACK", href: "#stack" },
    { num: "04", label: "ABOUT", href: "#about" },
    { num: "05", label: "CONTACT", href: "#contact" },
  ] satisfies NavLinkItem[],
  specRows: [
    { label: "NOW", value: "Software Developer · Retail & Invoicing Systems" },
    {
      label: "STACK",
      value: "Spring Boot · React Native · Rust · Next.js · PostgreSQL",
    },
    { label: "STATUS", value: "Open to select builds", highlight: true },
  ] satisfies SpecRowItem[],
  metrics: [
    { value: "100K+", label: "MOBILE APP USERS" },
    { value: "10K+", label: "ENTERPRISE ERP USERS" },
    { value: "50+", label: "B2B ORGS ONBOARDED" },
  ] satisfies MetricItem[],
  marqueeItems: [
    "JAVA",
    "SPRING BOOT",
    "POSTGRESQL",
    "REACT NATIVE",
    "RUST + TAURI",
    "NEXT.JS",
    "LANGGRAPH",
    "DOCKER",
    "AWS",
  ],
} as const;
