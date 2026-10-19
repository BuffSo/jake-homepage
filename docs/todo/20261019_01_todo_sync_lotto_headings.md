# TODO: 원본 포트폴리오 수정 두 건을 가져오고 replace 두 개 지우기

> 작성: 2026-10-19
> 상태: **완료** (2026-10-19, 브랜치 `chore/resync-lotto-headings`. 원본 커밋 `36937e1`까지 가져옴)

## 배경

career 저장소의 원본 `포트폴리오/소재희-포트폴리오.md`를 2026-10-19에 두 번 고쳤습니다. 한 번의 `npm run sync`로 둘 다 가져옵니다.

### 1. Lotto 소제목 (career `docs/todo/20261019_01_todo_portfolio_lotto_headings.md`)

`content/site/work.md` Lotto 챕터의 `replace` 두 개는 사이트에서만 소제목을 고쳐 쓰던 규칙입니다(커밋 `aa87785`, `578c8cb`). 같은 제목을 원본에도 넣었습니다.

| 지금 원본에 있는 제목 |
|---|
| 로그는 NoSQL인 MongoDB에 분리해서 저장했습니다 |
| 개발 모드에서 등급별 계정을 선택해 바로 테스트하게 했습니다 |

원본이 바뀐 채 동기화하면 두 `replace`의 `find`(옛 제목)가 맞을 곳이 없어 빌드와 테스트가 멈춥니다. 그래서 동기화와 `replace` 삭제를 한 커밋에서 합니다.

### 2. 이미지 MCP 표현 (career `docs/todo/20261015_03_todo_portfolio_image_mcp_wording.md`)

이 저장소가 2026-10-15에 원본 todo로 남긴 일입니다(`docs/devlog/2026-10-15-ai-plan.md` 6번). 원본 두 곳을 README(오픈소스 gemini-imagen-mcp-server 기반)에 맞췄습니다.

| 자리 | 옛 문구 | 새 문구 |
|---|---|---|
| 2절 "개발 외의 일" 표 | **MCP 서버를 직접 구현**해 Claude Code에 연결 | 오픈소스 서버를 바탕으로 **MCP 서버를 만들어** Claude Code에 연결 |
| 기술 스택 표 AI 줄 | MCP(자체 서버 구현) | MCP(오픈소스 기반 서버 제작) |

이력서 `소재희-이력서.md`의 Recueve 불릿도 같은 뜻으로 고쳤습니다: "이미지 생성 MCP 자작" → "오픈소스 기반 이미지 MCP 제작".

이 문구들을 찾는 규칙은 없어서 동기화만으로 들어옵니다.

### 3. 이력서 연락처의 홈페이지 주소 (career `docs/todo/20261019_02_todo_homepage_address_jakeso_dev.md`)

ADR-0011에 맞춰 이력서 연락처 표의 `홈페이지` 칸을 `https://jakeso.dev`로 바꿨습니다(2026-10-19). 동기화하면 `/resume`의 연락처 링크가 새 주소로 바뀝니다.

## 할 일

- [x] career 저장소에 포트폴리오 커밋 두 개와 이력서 커밋이 들어갔는지 확인합니다. `npm run sync`는 원본에 커밋하지 않은 변경이 있으면 멈춥니다(`--allow-dirty`는 미리 보기용).
- [x] `npm run sync`로 가져옵니다.
- [x] 같은 커밋에서 `content/site/work.md` Lotto 챕터의 `replace` 두 개(`로그는 관계형 DB에 넣지 않았습니다`, `등급이 3개라 계정 전환기를 만들었습니다`)를 지웁니다. Lotto 챕터에 다른 `replace`가 없으므로 `replace:` 키도 함께 지웁니다.
- [x] 아래 주석의 `Lotto: 4-3의 소제목 …` 두 줄을 지웁니다. 소제목을 고치는 규칙이 더 남지 않으므로 drop/replace 설명 줄의 "사이트에서 고쳐 쓴 소제목"도 지웁니다.
- [x] `content/site/ai/image-mcp.md` 22줄 주석의 "포트폴리오의 "직접 구현" 표현은 원본 저장소 todo로 남겼다"를 원본도 같은 뜻으로 고쳤다(2026-10-19)로 바꿉니다.
- [x] 빌드와 테스트로 `/work` Lotto 챕터에 새 제목이 그대로 나오는지, `/resume` 연락처의 홈페이지 링크가 `https://jakeso.dev`인지 확인합니다.
