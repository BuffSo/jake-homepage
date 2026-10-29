# TODO: career 저장소의 제출 서류 원본 경로 변경을 동기화 설정에 반영

> 작성: 2026-10-29
> 상태: **완료** (2026-10-29, `fix/sync-submission-docs-path`)
> 관련: career 저장소 CLAUDE.md 디렉토리 구조, 이 저장소 `scripts/sync.config.mjs`, `docs/adr/0003-content-source-and-sync.md`, 앞선 같은 일 `20261020_01_todo_career_resume_path.md`

## 배경

career 저장소가 2026-10-29에 제출 서류를 정리했습니다. 기준은 **최종 PDF는 맨 위(루트), 그 PDF를 만드는 원본과 참고 파일은 `서류함/` 아래**입니다. 포트폴리오와 AI 활용 사례 원본이 `서류함/` 아래로 내려갔습니다.

| 원본 | 전 경로 | 새 경로 |
|---|---|---|
| 포트폴리오 | `포트폴리오/소재희-포트폴리오.md` | `서류함/포트폴리오/소재희-포트폴리오.md` |
| AI 활용 사례 설정 | `AI활용사례/ProWith.json` | `서류함/AI활용사례/ProWith.json` |
| AI 활용 사례 본문 | `AI활용사례/ProWith.txt` | `서류함/AI활용사례/ProWith.txt` |
| AI 활용 사례 그림 | `AI활용사례/ProWith-4컷.png` | `서류함/AI활용사례/ProWith-4컷.png` |
| 이력서 | `이력서/소재희-이력서.md` | 그대로 |

- PDF는 모두 그대로 career 맨 위에 있습니다(`소재희-이력서.pdf`, `소재희-포트폴리오.pdf`, `소재희-AI활용사례.pdf`, `소재희-운영API장애-해결사례.pdf`). 경력기술서 PDF도 이번에 맨 위로 나왔습니다(`소재희-경력기술서.pdf`).
- 포트폴리오 그림(`assets/`)은 폴더째 옮겨서 md 안의 그림 경로는 바뀌지 않았습니다.
- 🟡 `ProWith.json`의 `"out"`이 `"../소재희-AI활용사례.pdf"`에서 `"../../소재희-AI활용사례.pdf"`로 바뀌었습니다(폴더가 한 단계 깊어짐). 내용(제목·칸·캡션)은 같습니다. 동기화하면 `ai-case.json`에 이 한 줄 차이가 생깁니다. 사이트가 `out`을 쓰지 않으면 그대로 받아도 됩니다.
- 이 설정은 옛 경로를 읽습니다. 고치기 전에 `npm run sync`를 돌리면 원본을 찾지 못합니다.
- career 커밋: `05bbe58` refactor: gather submission sources under 서류함 and finals at root (2026-10-29)

### 10-29 오후 확인: 동기화할 것은 이 todo의 두 가지뿐입니다

마지막 동기화 원본(career `cac7604`)과 career `0cd01d1`(10-29 오후)을 비교했습니다.

| 사이트가 읽는 원본 | 바뀐 것 |
|---|---|
| 이력서 `이력서/소재희-이력서.md` | 키피드 두 묶음의 순서만 바뀌었습니다(7줄 이동, 글은 같음 · 아래 할 일 마지막 줄) |
| 포트폴리오 | 경로만 바뀌고 글은 같습니다 |
| `ProWith.json` | `out` 한 줄만 다릅니다 |
| `ProWith.txt`, `ProWith-4컷.png` | 경로만 바뀌고 내용은 같습니다 |

같은 날 career에서 바뀐 다른 것은 사이트가 읽는 원본이 아니라 가져올 것이 없습니다.
- 경력기술서(`서류함/경력기술서/소재희-경력기술서.md`)의 형식 변경
- 사람인 간략 소개에서 `포트폴리오: https://jakeso.dev` 줄을 뺀 것
- 채용조사 HTML의 색인

## 할 일

- [x] `scripts/sync.config.mjs`의 `source` 네 줄 앞에 `서류함/`을 붙입니다(포트폴리오 1줄, AI 활용 사례 3줄).
- [x] `npm run sync -- --check`로 `portfolio.md`, `ai-case.txt`, `ai-case.png`가 원본과 같은지, `ai-case.json`은 `out` 한 줄만 다른지 확인합니다. 세 파일은 같았고, 다른 것은 `resume.md`, `ai-case.json`(`out` 한 줄), `manifest.json`이었습니다. 사이트는 `out`을 읽지 않아 그대로 받았습니다.
- [x] `docs/adr/0003-content-source-and-sync.md`의 `AI활용사례/` 언급은 그때의 기록이라 고칠지 이 저장소에서 판단합니다. 결정 당시의 기록이라 그대로 둡니다.
- [x] 사이트에서 career 경로를 직접 가리키는 곳이 더 있으면 함께 고칩니다. 지금 원본 위치를 설명하는 `docs/02-ia.md`의 두 줄을 고쳤습니다. devlog와 지난 todo는 그때의 기록이라 그대로 둡니다.
- [x] 같은 날 이력서 원본(`이력서/소재희-이력서.md`)도 바뀌었습니다. 키피드 업무 경험의 두 묶음 순서를 `서비스 개발` 먼저, `사업 기획` 뒤로 바꿨습니다(내용은 같음). 경로를 고친 뒤 `npm run sync`로 `resume.md`도 함께 다시 가져옵니다. career 커밋 `bef2623` docs(resume): put kipid service development before business planning.
