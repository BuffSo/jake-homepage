# TODO: Next.js를 16.4.6 이상으로 올린다

> 작성: 2026-11-17
> 상태: **완료** (2026-11-17). PR #62에서 16.4.6으로 올림. 운영 확인(확인 순서 7)은 머지 뒤

## 왜

- 지금 판은 `next` 16.4.2다. `npm audit --omit=dev`가 보안 권고 하나를 낸다(moderate).
  - [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h): `'use cache'` 함수를 `unstable_cache()`로 부를 때 root params 사이에 정보가 샐 수 있다. 해당 판은 16.3.0 이상 16.4.4 이하, 고친 판은 16.4.6이다(메이저가 아님).
- 이 사이트는 `unstable_cache`와 root params를 쓰지 않는다(`src`, `scripts`를 찾아봄, 2026-11-17). 그래서 지금 바로 위험하지는 않다.
- 에이전트가 `next build`를 돌리면 Next가 취약한 판이라는 안내를 내고 실패 코드로 멈춘다. 5분 안에 다시 돌리면 통과한다. CI와 사람이 돌리는 빌드에는 나오지 않는다(`node_modules/next/dist/lib/upgrade/nudge.js`). 판을 올리면 이 멈춤도 없어진다.

## 할 것

- 짧은 주소 PR(#61)을 머지한 뒤 카드를 따로 띄워 한다. 비용은 들지 않는다.
- feature 브랜치(`chore/next-patch-upgrade`)에서 `next`와 `eslint-config-next`를 같은 판으로 올린다. 같은 메이저 안의 판 올리기라 codemod는 돌리지 않는다(`node_modules/next/dist/lib/upgrade/same-major.md`).

## 확인 순서

1. 변경 기록을 읽는다: 지금 판의 다음 판부터 올릴 판까지 Next.js 릴리스 노트에서 동작이 바뀐 것(캐시, 라우팅, 메타데이터, 빌드)을 찾는다. 이 사이트가 쓰는 기능에 닿는 것이 있으면 PR 본문에 적는다.
2. `npm install`이 peer 의존성 오류 없이 끝나는지 본다. `npx next --version`이 올릴 판과 같은지 본다.
3. 잠금 파일(`package-lock.json`)의 변경을 본다. `next`, `eslint-config-next`와 그 하위 패키지만 바뀌어야 한다. 다른 패키지가 같이 바뀌었으면 이유를 PR 본문에 적는다.
4. `npm audit --omit=dev`에 권고가 남지 않는지 본다.
5. `npm run verify`를 통과시킨다(타입, 린트, 시험, 빌드, 데스크톱과 모바일 E2E, 화면 캡처). 빌드가 보안 안내로 멈추지 않는지도 본다.
6. PR을 열고 CI와 Vercel 미리보기 배포가 통과하는지 본다. 미리보기 주소에서 홈, `/work`, `/ai`, `/resume`을 연다.
7. 머지한 뒤 운영 배포가 끝나면 운영 주소를 일반 브라우저와 봇 User-Agent로 한 번씩 연다. 봇에게만 500이 났던 일이 있어서다(검색과 공유 가이드). 문제가 있으면 Vercel의 즉시 되돌리기로 앞 배포로 돌린 뒤 원인을 찾는다.
