// 첫 화면 기술 층의 기술-서비스 짝을 서비스 코드에서 확인하는 표지 (ADR-0010)
// npm run check:stack이 서비스 폴더마다 표지를 찾고, 그 결과가 content/site/home.md의 usedBy와 같은지 본다.
// 공개 저장소에 들어가므로 패키지와 파일 이름만 적는다. 서비스 저장소의 경로와 코드는 적지 않는다.
// 서비스 폴더 경로는 .env.local의 환경변수로 받는다. 기술마다 표지가 하나라도 맞으면 그 서비스가 쓴다고 본다.
//   dep          어느 package.json이든 dependencies나 devDependencies에 있는 이름
//   file         폴더 안 상대 경로에 맞는 정규식
//   file + text  file에 맞는 파일 안에 text가 있다. 파일 내용은 판정에만 쓰고 출력하지 않는다
// 낱말 표지는 주석 줄을 건너뛰고, 설정 표지는 빈 목록을 쓴 것으로 보지 않는다.

const name = (re) => new RegExp(`(^|/)${re}$`);
// 주석(#, //)으로 시작하지 않는 줄에 re가 있다
const line = (re) => new RegExp(`^(?!\\s*(#|//)).*${re}`, "m");

const config = {
  // Recueve는 저장소의 상위 작업 폴더를 받는다. 개발에 쓴 MCP 설정과 이미지 생성 결과가 그곳에 있다.
  services: { recueve: "RECUEVE_DIR", prowith: "PROWITH_DIR", "lotto-ai": "LOTTO_DIR" },
  // 빌드 결과, 의존성, 백업과 개인 메모 폴더는 걷지 않는다.
  skipDirs: ["node_modules", ".git", ".next", "dist", "build", ".turbo", "coverage", ".venv", "venv", "__pycache__", "context", "db-backups", "db-archive"],
  techs: {
    // 화면: 프레임워크와 스타일링 패키지
    "Next.js": [{ dep: "next" }],
    React: [{ dep: "react" }],
    Tailwind: [{ dep: "tailwindcss" }],
    // shadcn/ui는 패키지가 아니라 컴포넌트를 복사해 쓰는 방식이라, 설정 파일로 확인한다.
    "shadcn/ui": [{ file: name("components\\.json") }],
    // 조직도 같은 시각화
    "D3.js": [{ dep: "d3" }, { dep: "d3-org-chart" }],
    // API: 서버 프레임워크. Node.js는 패키지 매니페스트가 있으면 그 런타임에서 돈다고 본다
    NestJS: [{ dep: "@nestjs/core" }],
    "Node.js": [{ file: name("package\\.json") }],
    TypeScript: [{ dep: "typescript" }],
    // NestJS 서버의 다국어 응답
    "nestjs-i18n": [{ dep: "nestjs-i18n" }],
    // 서버가 연결을 열어 두고 알림을 밀어 주는 응답 형식
    SSE: [{ file: name("[^/]+\\.(ts|tsx|js|mjs)"), text: line("text/event-stream") }],
    // 워커: 큐 패키지
    BullMQ: [{ dep: "bullmq" }],
    // 워커 이미지에 설치해 영상 자막을 뽑는 명령줄 도구
    "yt-dlp": [{ file: name("Dockerfile[^/]*"), text: line("yt-dlp") }],
    // API 서버 안에서 도는 예약 작업
    Cron: [{ dep: "@nestjs/schedule" }],
    // Lambda 함수의 핸들러 타입
    Lambda: [{ dep: "@types/aws-lambda" }],
    // 예약 규칙은 배포 스크립트가 만든다.
    EventBridge: [{ file: name("[^/]+\\.sh"), text: line("EventBridge") }],
    // 서비스 코드가 예측 스크립트를 python3로 실행한다. .py 파일만으로 보면 서비스 밖의 작업 스크립트까지 잡힌다
    Python: [{ file: name("[^/]+\\.(ts|tsx|js|mjs)"), text: line("['\"`]python3?['\"`]") }],
    // 데이터: DB 종류는 Prisma 스키마의 provider로, Redis와 ORM은 클라이언트 패키지로 본다
    PostgreSQL: [{ file: name("schema\\.prisma"), text: line('provider\\s*=\\s*"postgresql"') }],
    MySQL: [{ file: name("schema\\.prisma"), text: line('provider\\s*=\\s*"mysql"') }],
    Redis: [{ dep: "ioredis" }, { dep: "redis" }],
    Prisma: [{ dep: "@prisma/client" }],
    // PostgreSQL을 Supabase에 두고 그 클라이언트로 읽고 쓴다
    Supabase: [{ dep: "@supabase/supabase-js" }],
    // 문서형 DB는 ODM이나 드라이버 패키지로 본다
    MongoDB: [{ dep: "mongoose" }, { dep: "mongodb" }],
    // GitHub Actions로 AWS에 배포하거나, 배포 스크립트가 AWS CLI로 Lambda를 올린다.
    AWS: [
      { file: name("\\.github/workflows/[^/]+\\.ya?ml"), text: line("aws-actions/") },
      { file: name("[^/]+\\.sh"), text: line("\\baws lambda ") },
    ],
    // 이미지를 만드는 Dockerfile
    Docker: [{ file: name("Dockerfile[^/]*") }],
    // Git 연동으로 배포하면 설정 폴더가 남고, 그렇지 않은 저장소는 README가 배포처를 적는다.
    Vercel: [{ file: name("\\.vercel/project\\.json") }, { file: name("README\\.md"), text: /Vercel/ }],
    // 워크플로 파일
    "GitHub Actions": [{ file: name("\\.github/workflows/[^/]+\\.ya?ml") }],
    // AI: Claude Code가 읽는 저장소 지침 파일
    "Claude Code": [{ file: name("CLAUDE\\.md") }],
    // Claude Code에 MCP 서버를 연결한 설정. 서버가 하나 이상 적혀 있어야 한다
    MCP: [
      { file: name("\\.mcp\\.json"), text: /"mcpServers"\s*:\s*\{\s*"/ },
      { file: name("\\.claude/settings(\\.local)?\\.json"), text: /"enabledMcpjsonServers"\s*:\s*\[\s*"|"mcpServers"\s*:\s*\{\s*"/ },
    ],
    // 제품 코드가 부르는 Anthropic SDK
    "Claude API": [{ dep: "@anthropic-ai/sdk" }],
    // 오픈소스 서버를 바탕으로 만든 이미지 생성 MCP 서버가 Gemini API로 만든 그림을 이 이름으로 저장한다.
    Gemini: [{ file: name("nano-banana_[^/]+") }],
  },
};

export default config;
