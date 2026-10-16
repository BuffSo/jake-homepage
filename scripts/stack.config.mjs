// 첫 화면 기술 층의 기술-서비스 짝을 서비스 코드에서 확인하는 표지 (ADR-0010)
// npm run check:stack이 서비스 폴더마다 표지를 찾고, 그 결과가 content/site/home.md의 usedBy와 같은지 본다.
// 공개 저장소에 들어가므로 패키지와 파일 이름만 적는다. 서비스 저장소의 경로와 코드는 적지 않는다.
// 서비스 폴더 경로는 .env.local의 환경변수로 받는다. 기술마다 표지가 하나라도 맞으면 그 서비스가 쓴다고 본다.
//   dep          어느 package.json이든 dependencies나 devDependencies에 있는 이름
//   file         폴더 안 상대 경로에 맞는 정규식
//   file + text  file에 맞는 파일 안에 text가 있다. 파일 내용은 판정에만 쓰고 출력하지 않는다

const name = (re) => new RegExp(`(^|/)${re}$`);

const config = {
  // Recueve는 저장소의 상위 작업 폴더를 받는다. 개발에 쓴 MCP 설정과 이미지 생성 결과가 그곳에 있다.
  services: { recueve: "RECUEVE_DIR", prowith: "PROWITH_DIR", "lotto-ai": "LOTTO_DIR" },
  // 빌드 결과, 의존성, 백업과 개인 메모 폴더는 걷지 않는다.
  skipDirs: ["node_modules", ".git", ".next", "dist", "build", ".turbo", "coverage", ".venv", "venv", "__pycache__", "context", "db-backups", "db-archive"],
  techs: {
    "Next.js": [{ dep: "next" }],
    React: [{ dep: "react" }],
    Tailwind: [{ dep: "tailwindcss" }],
    // shadcn/ui는 패키지가 아니라 컴포넌트를 복사해 쓰는 방식이라, 설정 파일로 확인한다.
    "shadcn/ui": [{ file: name("components\\.json") }],
    NestJS: [{ dep: "@nestjs/core" }],
    "Node.js": [{ file: name("package\\.json") }],
    TypeScript: [{ dep: "typescript" }],
    BullMQ: [{ dep: "bullmq" }],
    // API 서버 안에서 도는 예약 작업
    Cron: [{ dep: "@nestjs/schedule" }],
    Lambda: [{ dep: "@types/aws-lambda" }],
    // 예약 규칙은 배포 스크립트가 만든다.
    EventBridge: [{ file: name("[^/]+\\.sh"), text: /EventBridge/ }],
    PostgreSQL: [{ file: name("schema\\.prisma"), text: /provider\s*=\s*"postgresql"/ }],
    MySQL: [{ file: name("schema\\.prisma"), text: /provider\s*=\s*"mysql"/ }],
    Redis: [{ dep: "ioredis" }, { dep: "redis" }],
    Prisma: [{ dep: "@prisma/client" }],
    // GitHub Actions로 AWS에 배포하거나, 배포 스크립트가 AWS CLI로 Lambda를 올린다.
    AWS: [
      { file: name("\\.github/workflows/[^/]+\\.ya?ml"), text: /aws-actions\// },
      { file: name("[^/]+\\.sh"), text: /\baws lambda / },
    ],
    Docker: [{ file: name("Dockerfile[^/]*") }],
    // Git 연동으로 배포하면 설정 폴더가 남고, 그렇지 않은 저장소는 README가 배포처를 적는다.
    Vercel: [{ file: name("\\.vercel/project\\.json") }, { file: name("README\\.md"), text: /Vercel/ }],
    "GitHub Actions": [{ file: name("\\.github/workflows/[^/]+\\.ya?ml") }],
    "Claude Code": [{ file: name("CLAUDE\\.md") }],
    // Claude Code에 MCP 서버를 연결한 설정
    MCP: [{ file: name("\\.mcp\\.json") }, { file: name("\\.claude/settings(\\.local)?\\.json"), text: /"(enabledMcpjsonServers|mcpServers)"/ }],
    "Claude API": [{ dep: "@anthropic-ai/sdk" }],
    // 직접 만든 이미지 생성 MCP 서버가 Gemini API로 만든 그림을 이 이름으로 저장한다.
    Gemini: [{ file: name("nano-banana_[^/]+") }],
  },
};

export default config;
