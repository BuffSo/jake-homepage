// 홈에 쓰는 글을 빌드할 때 읽는다 (ADR-0003, ADR-0007).
// readFileSync만 쓰므로 Cache Components에서도 프리렌더에 그대로 들어간다.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { countAdrs, countCiChecks } from "./repo-stats.mjs";

const ROOT = process.cwd();

export type ProjectSlug = "recueve" | "prowith" | "lotto-ai";

export type Metric = { value: string; label: string };
export type Link = { label: string; href: string };

export type Layer = { name: string; items: string[]; usedBy: ProjectSlug[] };

export type Home = {
  headline: string;
  lines: [string, string];
  contact: { email: string; github: string };
  layers: Layer[];
  sections: Record<"work" | "ai", { label: string; title: string; intro: string }>;
  about: { label: string; title: string; body: string; quote: string; quoteBy: string };
};

export type Project = {
  slug: ProjectSlug;
  order: number;
  title: string;
  summary: string;
  headline: string;
  period: string;
  role: string;
  stack: string[];
  metric: Metric;
  liveUrl: string;
  liveLabel?: string;
  image: string;
  imageAlt: string;
};

export type AiWork = {
  slug: string;
  order: number;
  eyebrow: string;
  title: string;
  headline: string;
  desc: string;
  note?: string;
  metric: Metric;
  figure: "wiki-flow" | "image" | "hermes-flow" | "site-steps";
  image?: string;
  imageAlt?: string;
  links: Link[];
};

function read<T>(relative: string): T {
  const file = path.join(ROOT, relative);
  return parseFrontmatter(readFileSync(file, "utf8"), relative).data as T;
}

function readDir<T extends { order: number }>(relative: string): T[] {
  return readdirSync(path.join(ROOT, relative))
    .filter((f) => f.endsWith(".md"))
    .map((f) => read<T>(path.join(relative, f)))
    .sort((a, b) => a.order - b.order);
}

export function getHome(): Home {
  return read<Home>("content/site/home.md");
}

export function getProjects(): Project[] {
  return readDir<Project>("content/site/projects");
}

/** {adrCount} 같은 자리는 저장소에서 센 값으로 채운다. */
export function fillRepoStats(text: string): string {
  const stats: Record<string, number> = {
    adrCount: countAdrs(ROOT),
    ciCheckCount: countCiChecks(ROOT),
  };
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => (key in stats ? String(stats[key]) : whole));
}

export function getAiWorks(): AiWork[] {
  return readDir<AiWork>("content/site/ai").map((work) => ({
    ...work,
    metric: { value: fillRepoStats(work.metric.value), label: work.metric.label },
  }));
}
