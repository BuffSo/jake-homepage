// 홈에 쓰는 글을 빌드할 때 읽는다 (ADR-0003, ADR-0007).
// readFileSync만 쓰므로 Cache Components에서도 프리렌더에 그대로 들어간다.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { composeChapters } from "./portfolio.mjs";
import { countAdrs, countCiChecks } from "./repo-stats.mjs";
import { checkSections, splitResume } from "./resume.mjs";

const ROOT = process.cwd();
// 글을 읽는 경로는 이 폴더 아래로 고정한다. 경로 전체를 변수로 만들면 빌드가 프로젝트 전체를 서버 출력에 넣는다.
const SITE_DIR = path.join(process.cwd(), "content", "site");
// 같은 이유로 동기화한 포트폴리오도 파일 하나로 고정한다.
const PORTFOLIO = path.join(process.cwd(), "content", "synced", "portfolio.md");
const RESUME = path.join(process.cwd(), "content", "synced", "resume.md");

export type ProjectSlug = "recueve" | "prowith" | "lotto-ai";

export type Metric = { value: string; label: string };
export type Link = { label: string; href: string };

/** 기술 층의 기술 하나와 그 기술을 쓴 서비스. 짝은 서비스 코드로 확인한다 (ADR-0010) */
export type LayerItem = { name: string; usedBy: ProjectSlug[] };
export type Layer = { name: string; items: LayerItem[] };

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

export type AiGroup = "dev" | "product" | "beyond" | "personal";

/** content/site/ai/의 글. 상세 항목은 그림과 결과(또는 쓰는 법)를, 짧은 카드는 more(/work#…)를 갖는다. */
export type AiWork = {
  slug: string;
  order: number; // /ai 안 순서
  group: AiGroup;
  home?: number; // 홈 카드 순서 (홈에 싣는 넷만)
  eyebrow: string;
  title: string;
  headline?: string;
  desc?: string; // 홈 카드 설명
  note?: string; // 홈 카드 아래 한 줄
  problem: string;
  built: string;
  result?: string;
  usage?: string; // 개인 도구는 결과 대신 쓰는 법
  metric: Metric;
  figure?: "wiki-flow" | "image" | "hermes-flow" | "site-steps" | "review-flow" | "mcp-flow" | "workbench-flow";
  image?: string;
  imageAlt?: string;
  links: (Link & { home?: boolean })[];
  more?: string;
};

export type AiPage = { groups: { id: AiGroup; title: string }[] };

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

export type ResumePage = {
  label: string;
  title: string;
  description: string;
  print: string;
  sections: { id: string; title: string }[];
};

/** 동기화한 이력서. 머리(한 줄 소개, 이름)와 본문으로 나눈다 (src/lib/resume.mjs) */
export type Resume = { tagline: string; name: string; body: string };

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

/** /ai의 항목 전부, 페이지 순서 */
export function getAiWorks(): AiWork[] {
  return readDir<AiWork>("ai").map((work) => ({
    ...work,
    metric: { value: fillRepoStats(work.metric.value), label: work.metric.label },
  }));
}

/** 홈 카드에 싣는 넷, 홈 순서 */
export function getHomeAiWorks(): AiWork[] {
  return getAiWorks()
    .filter((work) => work.home !== undefined)
    .sort((a, b) => a.home! - b.home!);
}

export function getAiPage(): AiPage {
  return read<AiPage>("ai-page.md");
}

export function getResumePage(): ResumePage {
  return read<ResumePage>("resume-page.md");
}

/** 원문 이력서를 머리와 본문으로 나눈다. 원문의 절이 목차와 다르면 빌드가 멈춘다. */
export function getResume(): Resume {
  const resume = splitResume(readFileSync(RESUME, "utf8"));
  checkSections(resume.body, getResumePage().sections);
  return resume;
}
