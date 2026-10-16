import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import config from "../stack.config.mjs";
import { compareStack, detectTechs, listFiles, readService } from "./stack.mjs";

const tempDirs = [];
after(() => tempDirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

// 상대 경로와 내용으로 임시 서비스 폴더를 만든다.
function fixture(files) {
  const root = mkdtempSync(path.join(tmpdir(), "stack-"));
  tempDirs.push(root);
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), content);
  }
  return root;
}

const pkg = (deps, devDeps = {}) => JSON.stringify({ dependencies: deps, devDependencies: devDeps });

test("폴더를 걸을 때 뺄 폴더는 들어가지 않는다", () => {
  const root = fixture({ "a/package.json": "{}", "node_modules/x/package.json": "{}", "context/note.md": "", "b/c/CLAUDE.md": "" });
  assert.deepEqual(listFiles(root, config.skipDirs).sort(), ["a/package.json", "b/c/CLAUDE.md"]);
});

test("의존성은 모든 package.json의 dependencies와 devDependencies에서 모은다", () => {
  const root = fixture({
    "apps/web/package.json": pkg({ next: "16" }, { tailwindcss: "4" }),
    "apps/api/package.json": pkg({ "@nestjs/core": "11" }),
    "broken/package.json": "{",
  });
  assert.deepEqual([...readService(root, config.skipDirs).deps].sort(), ["@nestjs/core", "next", "tailwindcss"]);
});

test("표지 설정으로 서비스가 쓰는 기술을 찾는다", () => {
  const root = fixture({
    "package.json": pkg({ next: "16", react: "19", ioredis: "5" }, { typescript: "5", "@types/aws-lambda": "8" }),
    "components.json": "{}",
    "prisma/schema.prisma": 'datasource db {\n  provider = "postgresql"\n}',
    "scripts/deploy.sh": "aws lambda update-function-code\n# EventBridge 규칙",
    ".vercel/project.json": "{}",
    "CLAUDE.md": "",
    ".mcp.json.backup": "{}",
    "Dockerfile.dev": "",
  });
  const found = detectTechs(readService(root, config.skipDirs), config.techs);
  assert.deepEqual(
    [...found].sort(),
    ["AWS", "Claude Code", "Docker", "EventBridge", "Lambda", "Next.js", "Node.js", "PostgreSQL", "React", "Redis", "TypeScript", "Vercel", "shadcn/ui"].sort(),
  );
});

test("파일 안의 낱말 표지는 그 이름의 파일만 본다", () => {
  const root = fixture({
    "README.md": "프런트엔드는 Vercel에 배포합니다",
    ".github/workflows/deploy.yml": "uses: aws-actions/configure-aws-credentials@v4",
    ".claude/settings.local.json": '{ "enabledMcpjsonServers": ["serena"] }',
    "docs/notes.txt": 'provider = "mysql"',
    "imagen/nano-banana_1.png": "",
  });
  const found = detectTechs(readService(root, config.skipDirs), config.techs);
  assert.deepEqual([...found].sort(), ["AWS", "GitHub Actions", "Gemini", "MCP", "Vercel"].sort());
});

const LAYERS = [
  { name: "화면", items: [{ name: "Next.js", usedBy: ["a", "b"] }, { name: "Tailwind", usedBy: ["a"] }] },
];
const TECHS = { "Next.js": [], Tailwind: [] };

test("층 데이터와 표지 판정이 같으면 어긋남이 없다", () => {
  const detected = { a: new Set(["Next.js", "Tailwind"]), b: new Set(["Next.js"]) };
  assert.deepEqual(compareStack(LAYERS, TECHS, detected), []);
});

test("층 데이터와 표지 판정이 다르면 양쪽 방향을 모두 알린다", () => {
  const detected = { a: new Set(["Next.js"]), b: new Set(["Next.js", "Tailwind"]) };
  assert.deepEqual(compareStack(LAYERS, TECHS, detected), [
    "Tailwind · a: 층 데이터에 있는데 코드에 표지가 없음",
    "Tailwind · b: 코드에 표지가 있는데 층 데이터에 없음",
  ]);
});

test("확인하지 않은 서비스는 견주지 않는다", () => {
  assert.deepEqual(compareStack(LAYERS, TECHS, { a: new Set(["Next.js", "Tailwind"]) }), []);
});

test("층의 기술과 표지 설정의 기술이 다르면 알린다", () => {
  assert.deepEqual(compareStack(LAYERS, { "Next.js": [], Redis: [] }, {}), ["Tailwind: 표지 설정에 없는 기술", "Redis: 층에 없는 기술"]);
});
