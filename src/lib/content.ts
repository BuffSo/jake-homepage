// 홈에 쓰는 글을 빌드할 때 읽는다 (ADR-0003, ADR-0007).
// readFileSync만 쓰므로 Cache Components에서도 프리렌더에 그대로 들어간다.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { composeChapters } from "./portfolio.mjs";
import { countAdrs, countCiChecks } from "./repo-stats.mjs";

const ROOT = process.cwd();
// 글을 읽는 경로는 이 폴더 아래로 고정한다. 경로 전체를 변수로 만들면 빌드가 프로젝트 전체를 서버 출력에 넣는다.
const SITE_DIR = path.join(process.cwd(), "content", "site");
// 같은 이유로 동기화한 포트폴리오도 파일 하나로 고정한다.
const PORTFOLIO = path.join(process.cwd(), "content", "synced", "portfolio.md");

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

export type WorkPage = {
  label: string;
  title: string;
  intro: string;
  introSite: string;
  sites: { label: string; title: string; intro: string };
  chapters: {
    slug: ProjectSlug;
    detail: string;
    ai?: string;
    aiUntil?: string;
    howToView: string;
    drop?: string[];
    replace?: { find: string; to: string }[];
  }[];
};

/** 포트폴리오 원문으로 만든 /work 챕터 (src/lib/portfolio.mjs) */
export type WorkChapter = {
  slug: ProjectSlug;
  head: {
    name: string;
    subtitle: string;
    period: string;
    role: string;
    url: string;
    stack: string[];
    lead: string;
  };
  howToView: string;
  body: string;
  ai: { title: string; body: string } | null;
};

export type SiteSlug = "brainhouse" | "aitools";

export type Site = {
  slug: SiteSlug;
  order: number;
  title: string;
  domain: string;
  summary: string;
  workflow?: string;
  flow?: string;
  role: string;
  period: string;
  commits: string;
  stack: string[];
  liveUrl: string;
  sourceUrl: string;
  imageAlt: string;
};

/** content/site/ 아래의 글 하나 */
function read<T>(relative: string): T {
  const text = readFileSync(path.join(SITE_DIR, relative), "utf8");
  return parseFrontmatter(text, path.join("content/site", relative)).data as T;
}

/** content/site/ 아래 폴더의 글 전부, order 순서 */
function readDir<T extends { order: number }>(folder: string): T[] {
  return readdirSync(path.join(SITE_DIR, folder))
    .filter((f) => f.endsWith(".md"))
    .map((f) => read<T>(path.join(folder, f)))
    .sort((a, b) => a.order - b.order);
}

export function getHome(): Home {
  return read<Home>("home.md");
}

export function getProjects(): Project[] {
  return readDir<Project>("projects");
}

export function getWork(): WorkPage {
  return read<WorkPage>("work.md");
}

export function getSites(): Site[] {
  return readDir<Site>("sites");
}

/** 포트폴리오 원문을 work.md의 구성대로 잘라 챕터로 만든다. 원문이 바뀌어 규칙이 맞지 않으면 빌드가 멈춘다. */
export function getWorkChapters(): WorkChapter[] {
  return composeChapters(readFileSync(PORTFOLIO, "utf8"), getWork().chapters) as WorkChapter[];
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
  return readDir<AiWork>("ai").map((work) => ({
    ...work,
    metric: { value: fillRepoStats(work.metric.value), label: work.metric.label },
  }));
}
