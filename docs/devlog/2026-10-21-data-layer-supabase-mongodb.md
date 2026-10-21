# 2026-10-21 데이터 층에 Supabase와 MongoDB

## 한 일

- 첫 화면 기술 층의 데이터 층에 Supabase와 MongoDB를 더했습니다. 둘 다 GENYS Lotto 코드(`@supabase/supabase-js`, `mongoose`)와 이력서 Lotto 항목에 있는데 층에는 없었습니다.
- 데이터 층 줄은 PostgreSQL · MySQL · MongoDB · Redis가 됐습니다.
  - Supabase와 Prisma는 층 줄에 싣지 않고(`detailOnly`), 층을 눌렀을 때 서비스별 줄에만 보입니다.
  - Lotto 줄은 PostgreSQL · Supabase · MongoDB · Redis · Prisma입니다.
- 서비스마다 그 서비스만의 일을 보여 주는 기술 넷을 서비스별 줄에만 더했습니다(`detailOnly`).
  - ProWith 화면: D3.js (조직도)
  - Recueve·ProWith API: nestjs-i18n (다국어 응답)
  - Lotto API: SSE (실시간 알림)
  - Recueve 워커: yt-dlp (영상 자막 추출)
- 층 줄은 층마다 네 개까지라는 테스트를 더했습니다.
- 서비스 목록 세 칸이 같은 높이를 잡게 했습니다. 세 서비스의 기술 줄을 모두 겹쳐 둡니다.
- 비교판과 구현 캡처는 [design/stack-source](../design/stack-source/)의 `data-layer-board-*`, `layer-data-*`에 있습니다.

## 흐름

| # | AI 제안 | 판단 | 결과 |
|---|---|---|---|
| 1 | Supabase만 데이터 층에 넣는다. MongoDB까지 넣으면 층 줄이 넘칠 수 있다 | 둘 다 넣고 싶다. 길이가 문제인지 확인한다 | 개발 서버에서 쟀다. 하나만 더해도 360~390 폭과 1024 폭에서 두 줄로 넘쳤다 |
| 2 | 층 줄은 그대로 두고, 더하는 기술은 층을 눌렀을 때 서비스별 줄에만 보이게 한다 | 그렇게 하되, 층 줄의 Prisma를 MongoDB로 바꾼다(사람의 제안) | 층 줄이 저장소만 남아 뜻이 또렷해졌다. 모든 폭에서 한 줄에 들어간다 |
| 3 | 1280에서 Lotto 데이터 줄만 두 줄이 되어 Lotto 칸 주소가 내려간다. 세 칸이 같은 높이를 잡게 한다 | 받아들임 | 시안을 다시 찍어 승인받았고, 구현 화면은 시안과 픽셀까지 같다 |
| 4 | 서비스별 줄에만 더할 기술로 Nginx, Passport, NextAuth.js를 추천 | 셋 다 웹 서비스면 흔히 쓰는 것이라 특색이 없다 | 서비스마다 그 서비스만의 일을 보여 주는 기술로 다시 골랐다: yt-dlp, D3.js, SSE |
| 5 | (사람의 제안) 길이 때문에 못 넣은 라이브러리(TanStack Query, Recharts 등)를 데스크톱에서만 보여 준다 | AI가 반대: 데스크톱도 줄이 늘어 첫 화면이 길어지고, 기기마다 보이는 사실이 달라지며, 층이 라이브러리 목록이 된다 | 데스크톱 전용은 하지 않음 |
| 6 | (사람의 제안) Recharts와 nestjs-i18n도 더한다 | 재 보니 nestjs-i18n은 휴대폰에서도 한 줄. Recharts는 ProWith 코드에도 있어 ProWith 화면 줄이 57자가 되고 휴대폰에서 두 줄로 넘친다 | nestjs-i18n만 더함 |
| 7 | yt-dlp는 명령줄 도구라 기술 스택으로 보기 어렵다. 빼고 Recueve 워커 줄은 BullMQ 하나로 둔다 | 서비스 본문에 나오는 도구이고, 워커 줄이 BullMQ 하나면 썰렁하다 | yt-dlp를 넣음 |

## 검증

- `npm run check:stack`: 세 서비스 코드와 대조해 통과했습니다. Supabase와 MongoDB는 lotto-ai에서만 잡혔습니다.
- `npm test`, `npm run verify` 결과는 PR에 붙입니다.
- 개발 서버에서 1280, 1024, 768, 390, 375, 360 폭을 쟀습니다.
  - 모든 층 줄이 한 줄입니다.
  - 데스크톱(1280, 1024)에서 세 칸 주소 높이가 같습니다.
  - 1280·375 캡처는 평소와 데이터 층 누름 두 상태 모두 비교판 시안과 같습니다.

## 다음

- 다른 층에 기술을 더할 때도 층 줄은 네 개까지입니다. 그 이상은 `detailOnly`로 둡니다.
