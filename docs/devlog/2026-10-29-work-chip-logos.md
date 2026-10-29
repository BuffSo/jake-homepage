# 2026-10-29 /work 스택 칩 로고

## 한 일

- `/work` 스택 칩 앞에 단색 로고를 넣었습니다. 이력서 칩과 같은 로고, 같은 크기입니다(`src/components/work/stack-chips.tsx`).
- 두 칩 목록이 같은 찾기 규칙을 쓰도록 `techLogo`를 `src/lib/tech-logos.mjs`에 두었습니다. 이름 끝의 버전 숫자는 떼고 찾습니다.
- 로고 목록에 Tailwind CSS, Three.js, Resend, Vitest를 더했습니다(simple-icons 16.36.0). `/work` 칩 24개 중 17개에 로고가 붙습니다.
- 정한 값과 캡처는 [03-design.md](../03-design.md)의 "F2에서 정한 값"과 [docs/design/work-chip-logos/](../design/work-chip-logos/)에 있습니다.

## 흐름

| # | AI 제안 | 판단 | 결과 |
|---|---|---|---|
| 1 | `/work` 칩에도 로고를 넣자. 같은 프로젝트의 스택이 `/work`에서는 글자만, `/resume`에서는 로고와 함께 나온다 | 추천안을 고름 | 이력서 칩과 같은 값으로 넣음 |
| 2 | `/work`에만 있는 이름 중 simple-icons에 그림이 있는 넷을 더하자. 더하지 않으면 사이트 카드 칩 12개 중 9개가 글자만 남는다 | 추천안을 고름 | 24개 중 17개에 로고 |
| 3 | 첫 화면 기술 층에는 넣지 말자. 칩이 아니라 글자 줄이라 칩 모양을 맞출 대상이 아니다 | 추천안을 고름 | 기술 층은 그대로 |
| 4 | simple-icons의 Framer 그림은 디자인 도구 Framer의 로고라 Motion 라이브러리에 쓰지 말자 | 모두 추천대로 정할 때 함께 받아들임 | Motion은 글자만 |

## 바로잡은 것

- 없음

## 검증

- `npm test` 162개 통과. `techLogo`가 버전 숫자를 떼고 찾는지, 그림이 없는 이름은 비는지 봅니다.
- `e2e/work.spec.ts`, `e2e/resume.spec.ts` 60개 통과. `/work` 칩 이름이 원문 그대로이고, 로고는 `aria-hidden`이며, AWS 칩에는 로고가 없는지 봅니다.
- 개발 서버에서 구현 화면을 비교판의 로고 시안과 같은 자리로 찍어 픽셀이 같은지 확인했습니다(1280, 375, 다크).

## 다음

- 없음
