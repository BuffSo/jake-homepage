// 민감정보 검사 규칙 (ADR-0006)
// check-sensitive.mjs(커밋 전, CI)와 sync-content.mjs(동기화 결과를 쓰기 전)가 함께 쓴다.

import { existsSync, readFileSync } from "node:fs";

// 공개해도 되는 이메일: 사이트에 싣는 연락처, GitHub noreply, 예시 도메인
// 연락처는 홈과 /resume 모두 gmail 하나다(2026-10-17 원본 이력서 연락처 변경).
const ALLOWED_EMAILS = [
  /^buff4701@gmail\.com$/i,
  /@users\.noreply\.github\.com$/i,
  /@example\.(com|org|net)$/i,
  /^git@github\.com$/i,
];

const RULES = [
  { id: "phone-mobile", re: /(?<!\d)01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)/g },
  { id: "phone-landline", re: /(?<!\d)0(?:2|[3-6][1-5])[-.\s]\d{3,4}[-.\s]\d{4}(?!\d)/g },
  { id: "resident-number", re: /(?<!\d)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])-[1-4]\d{6}(?!\d)/g },
  { id: "local-path", re: /\/Users\/[^/\s"'`)]+|\/home\/[a-z_][a-z0-9_-]*\/|[A-Za-z]:\\Users\\/g },
  { id: "anthropic-key", re: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { id: "openai-key", re: /sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{32,}/g },
  { id: "aws-access-key", re: /(?:AKIA|ASIA)[0-9A-Z]{16}/g },
  { id: "github-token", re: /gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,}/g },
  { id: "google-api-key", re: /AIza[0-9A-Za-z_-]{35}/g },
  { id: "slack-token", re: /xox[abprs]-[A-Za-z0-9-]{10,}/g },
  { id: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { id: "secret-assignment", re: /\b(?:api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*["'][^"'\s]{12,}["']/gi },
];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// 비공개 금지어 목록 (git 제외 파일). 한 줄에 하나, #으로 시작하면 주석.
// 파일이 없으면 null을 돌려준다. 없는 것과 비어 있는 것을 호출하는 쪽이 구분할 수 있게 하기 위해서다.
export const PRIVATE_TERMS_FILE = ".sensitive-terms.local";

export function readPrivateTerms(file = PRIVATE_TERMS_FILE) {
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
}

// 찾은 값은 가려서 출력한다. 검사 결과 로그가 또 다른 노출 경로가 되지 않게 하기 위해서다.
export function mask(value) {
  const v = value.trim();
  return v.length <= 4 ? "****" : `${v.slice(0, 2)}${"*".repeat(Math.min(v.length - 2, 8))}`;
}

// 글 하나를 검사해 { line, id, shown } 목록을 돌려준다. line은 1부터 센다.
export function scanText(content, privateTerms = []) {
  const findings = [];

  content.split("\n").forEach((text, i) => {
    const line = i + 1;

    for (const { id, re } of RULES) {
      for (const m of text.matchAll(re)) findings.push({ line, id, shown: mask(m[0]) });
    }

    for (const m of text.matchAll(EMAIL_RE)) {
      if (!ALLOWED_EMAILS.some((re) => re.test(m[0]))) {
        findings.push({ line, id: "email", shown: mask(m[0]) });
      }
    }

    const lower = text.toLowerCase();
    privateTerms.forEach((term, n) => {
      if (lower.includes(term.toLowerCase())) {
        findings.push({ line, id: `private-term#${n + 1}`, shown: "(비공개 목록)" });
      }
    });
  });

  return findings;
}
