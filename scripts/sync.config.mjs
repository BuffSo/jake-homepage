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
      source: "이력서/소재희-이력서.md",
      output: "resume.md",
      transforms: [
        {
          type: "drop-table-column",
          header: "전화번호",
          reason: "공개 페이지에 전화번호를 싣지 않는다 (ADR-0006)",
        },
        {
          type: "insert-before",
          startsWith: "※ 정부 R&D",
          body: [
            "**[본인의 강점]**",
            "",
            "완성 지향: 맡은 일은 끝까지 책임지고 높은 품질로 마무리합니다.",
            "본질 탐구: 현상 뒤의 의미를 깊이 파악하고 더 나은 가설·대안을 제시합니다.",
            "집중과 몰입: 우선순위에 집중해 핵심 과제를 흔들림 없이 처리합니다.",
            "신중·계획형 실행: 리스크를 고려해 계획적으로 추진합니다.",
            "효율적 선택: 여러 대안을 비교해 최선의 방법을 고릅니다.",
          ].join("\n"),
          reason: "원본은 2026-10-28에 강점을 뺐지만 사이트의 이력서에는 남긴다 (본인 결정 2026-10-28, ADR-0003)",
        },
        {
          type: "append-section",
          heading: "## 자격증",
          body: "- **전기공사기사 1급** | 한국산업인력관리공단 (1995.08)",
          reason: "원본은 2026-10-27에 자격증 절을 뺐지만 사이트의 이력서에는 남긴다 (본인 결정 2026-10-27, ADR-0003)",
        },
      ],
    },
    {
      source: "포트폴리오/소재희-포트폴리오.md",
      output: "portfolio.md",
      transforms: [],
    },
    // AI 도구 활용 사례(/ai/case). PDF가 아니라 PDF를 만드는 세 파일을 읽는다 (ADR-0003 원본 추가).
    {
      source: "AI활용사례/ProWith.json",
      output: "ai-case.json",
      transforms: [
        {
          type: "replace-line",
          startsWith: '"subtitle":',
          with: '"subtitle": "ProWith · MLM 정산 솔루션",',
          reason: "부제 뒤의 작성자 이름은 사이트 머리와 푸터에 이미 있어 뺀다 (ADR-0003)",
        },
      ],
    },
    {
      source: "AI활용사례/ProWith.txt",
      output: "ai-case.txt",
      transforms: [],
    },
    {
      // 그림은 바이트 그대로 옮긴다. 민감정보 검사가 글자만 읽으므로 가져올 때 눈으로 확인한다.
      source: "AI활용사례/ProWith-4컷.png",
      output: "ai-case.png",
      transforms: [],
    },
  ],
};

export default config;
