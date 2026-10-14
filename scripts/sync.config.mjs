// 콘텐츠 동기화 허용 목록과 변환 규칙 (ADR-0003 구현 원칙)
// 여기에 적힌 원본 파일만 읽는다. 무엇을 공개하는지가 이 파일의 diff로 보인다.
// source는 원본 저장소(CAREER_DIR) 안의 상대 경로, output은 content/synced/ 안의 파일 이름이다.
// 규칙은 공개 저장소에 들어가므로 값이 아니라 항목 이름으로 찾는다.
// 원본은 고치지 않는다. 원본에도 반영할 만한 수정은 원본 저장소의 docs/todo/에 남긴다.
// 원본에 반영되어 찾을 대상이 없어지면 동기화가 멈추므로, 그때 해당 규칙을 지운다.

const config = {
  outputDir: "content/synced",
  files: [
    {
      source: "소재희-이력서.md",
      output: "resume.md",
      transforms: [
        {
          type: "drop-table-column",
          header: "전화번호",
          reason: "공개 페이지에 전화번호를 싣지 않는다 (ADR-0006)",
        },
        {
          type: "drop-line",
          startsWith: "※ 태니지먼트",
          reason: "특정 독자를 상정한 안내 문구라 공개 페이지에서는 뺀다 (ADR-0002)",
        },
        {
          type: "replace-line",
          startsWith: "- AI 도구 활용 개발 - Claude Code로",
          with: "- AI 도구 활용 개발 - Claude Code로 레거시 코드 분석",
          reason: "근거 없는 생산성 수치는 싣지 않는다 (CLAUDE.md 글쓰기)",
        },
        {
          type: "replace-line",
          startsWith: "- **AI 도구 활용 개발 생산성 향상**",
          with: "- **AI 도구 활용 개발** - Claude Code로 레거시 분석과 구현",
          reason: "근거 없는 생산성 수치는 싣지 않는다 (CLAUDE.md 글쓰기)",
        },
        {
          type: "drop-line",
          startsWith: "- 레거시 분석 시간",
          reason: "근거 없는 생산성 수치는 싣지 않는다 (CLAUDE.md 글쓰기)",
        },
        {
          type: "drop-line",
          startsWith: "🔗 https://heartlink.kr",
          reason: "도메인을 찾을 수 없어 링크를 걸지 않는다 (2026-10-14 확인)",
        },
      ],
    },
    {
      source: "포트폴리오/소재희-포트폴리오.md",
      output: "portfolio.md",
      transforms: [],
    },
  ],
};

export default config;
