---
title: 직접 만든 영어 회화 연습 앱
subtitle: Jake English
description: 해 보고 싶은 상황을 직접 정해 AI 선생님과 영어로 대화하고, 듣고 따라 말하며 연습하는 앱입니다.
video:
  href: https://www.youtube.com/watch?v=5FByJLa8R1k
  caption: 소개 영상 · 3분 17초 · YouTube에서 보기
story:
  - caption: 외국인이 길을 물었습니다. 말은 알아들었는데 첫마디가 나오지 않았습니다.
  - caption: 그 상황을 앱에서 직접 정하고, 라이언과 같은 대화를 연습합니다.
  - caption: 말이 막히면 소희가 옆에서 도와줍니다.
  - caption: 같은 상황이 다시 오면 이번에는 막히지 않고 답합니다.
panels:
  - caption: 라이언이 인사하고 무엇을 연습할지 묻습니다. 대본으로 주고받는 대화 연습하기, 대본 없는 자유 대화, 지난 것을 다시 하는 복습하기 가운데 고릅니다.
  - caption: 해 보고 싶은 상황을 직접 말하거나 쓰면 그 상황의 대본이 만들어집니다. 목록에서 고르거나 추천받을 수도 있습니다. 누가 먼저 말할지는 상황에 따라 정해집니다.
  - caption: 내 차례에는 라이언의 본보기를 듣고 내 대사를 말합니다(섀도잉). 0.6배, 0.8배로 느리게 다시 듣고, 세게 읽을 곳과 한글 발음도 봅니다. 말하면 다르게 들린 낱말을 짚어 줍니다.
  - caption: 대본 없이 라이언과 영어로 이야기합니다. 말이 막히면 소희가 라이언이 무엇을 묻는지 알려 주고, 답할 힌트를 줍니다. 끝나면 고칠 곳을 하나씩 돌아봅니다.
chapters:
  - title: 왜 만들었나
    body: 외국인이 길을 물었을 때 말은 알아들었는데 첫마디가 나오지 않았습니다. 요즘 K팝과 K뷰티처럼 한국이 여러 분야에서 주목받으면서 외국인 관광객이 부쩍 늘어, 일상에서 영어로 대화하는 연습을 다시 하고 싶었습니다. AI 활용이 일상이 되면서 AI 튜터도 많이 생겼지만, 써 보니 제 입맛에 맞지 않았습니다. 어떤 상황이든 직접 정해 대화를 연습하고, 제 입맛에 맞게 반응하는 앱이 필요했습니다. 그래서 제가 직접 만들었습니다.
  - title: 어떻게 동작하나
    body: 폰 앱은 화면과 녹음, 재생만 합니다. 받아쓰기(whisper.cpp)와 목소리(Qwen3-TTS)는 제 Mac에서 만들고, Claude API에는 글만 보냅니다. 집 밖에서는 폰이 개인 망(Tailscale)으로 Mac에 붙습니다.
  - title: AI와 일한 방식
    body: 기능마다 Claude Code로 스펙과 계획을 쓰고, 코드와 테스트를 만들고, PR을 리뷰했습니다. 무엇을 만들지, 여러 안 가운데 무엇을 고를지, 머지할지는 제가 정했습니다.
  - title: 일하는 구조
    body: 기능마다 git worktree를 하나씩 만들고 세션을 따로 띄워 동시에 작업합니다. 저는 프로젝트마다 main 세션 하나와 이야기하며 무엇을 할지 정하고 머지를 판단합니다. 세션마다 컨텍스트가 따로라 여러 프로젝트를 함께 진행해도 main 세션만 챙기면 됩니다.
  - title: 닷새 남짓 동안 머지한 PR
    metric:
      value: PR 78개
      label: '2026-11-04 ~ 11-09 · 머지한 PR'
    body: 닷새 남짓 동안 PR 78개를 머지했습니다. 그 가운데 58개는 리뷰 에이전트(pr-review)가 먼저 검토했고, AI의 제안과 제 판단은 기능마다 작업 일지에 남겼습니다.
stack:
  - group: 폰 앱
    items: [React Native, Expo, TypeScript]
  - group: Mac 서버
    items: [Python, FastAPI]
  - group: 음성 (Mac에서 실행)
    items: [whisper.cpp, Qwen3-TTS]
  - group: AI
    items: [Claude API]
  - group: 연결
    items: [Tailscale]
---

<!--
/ai/jake-english 페이지와 /ai 맨 위 Jake English 띠의 글 (docs/02-ia.md, docs/superpowers/specs/2026-11-11-ai-jake-english-design.md).
사이트 전용 글이다. 이력서와 포트폴리오에는 없다(ADR-0003). 문구는 설계에서 고른 그대로 쓴다.
- 앱의 구성(Android 앱과 Mac 서버, whisper.cpp, Qwen3-TTS, Claude API, Tailscale)은 본인이 확인했다(2026-11-11).
- PR 수는 jake-english 저장소에서 gh pr list --state merged로 셌다(2026-11-11). 한국 시각 11-04~11-09에 머지한 PR이 78개,
  그 가운데 pr-review 스킬의 리뷰 코멘트가 달린 PR이 58개다. 저장소가 더 자라도 날짜 범위의 값이라 바꾸지 않는다.
- 영상 아래 한 줄 끝의 화살표는 화면에서 붙인다(읽지 않는 장식).
- 이야기 4컷은 Gemini 앱으로 그린 그림이다. 이야기 4컷 절 소제목 "이야기 4컷"과 story의 1, 2번 문구(설계의 W11, W12)는 추천안으로 정했고 사용자가 확인했다(2026-11-11). story의 3, 4번과 panels의 3번은 2026-11-11에 사용자가 직접 고쳐 썼다.
- chapters의 1장 문단(설계의 W9-1)은 2026-11-11에 사용자가 화면을 보고 여러 번 고쳐 썼다. 순서는 첫마디가 나오지 않은 일, 외국인 관광객이 늘어 일상 영어를 다시 연습하려 함, AI 활용이 일상이 되며 많이 생긴 AI 튜터가 입맛에 맞지 않음, 입맛에 맞게 반응하는 앱이 필요함, 직접 만듦이다. AI 튜터를 무엇으로 만들었는지는 근거가 없어 시대는 AI 코딩이 아니라 AI 활용으로 쓴다. 말할 때마다 바로 짚어 주는 것은 다른 AI 튜터도 하는 일이라 다른 점으로 내세우지 않고, 제 입맛에 맞게 반응하는 앱을 직접 만들었다는 것을 앞에 둔다. 1장 그림의 세 줄(첫마디, AI 튜터, 그래서)도 이 문단에 맞춰 바꿨다.
- 연습하는 방법 절의 소제목 연습하는 방법과 panels의 네 칸 문구는 앱 코드에서 확인한 사실로 정한 추천안이다(2026-11-11). 번호와 연습 흐름이라는 순서는 번호 순서가 라이언이 늘 먼저 묻는 흐름처럼 읽혀서 뺐다.
- stack은 본문 다섯 장 뒤의 기술 스택 절이다. 묶음 이름과 항목은 본인이 확인했고(2026-11-11), 기술 이름은 jake-english 저장소의 코드로 확인했다(ADR-0010의 원칙, 2026-11-11).
  폰 앱은 app/package.json(expo ~58, react-native 0.88, typescript), Mac 서버는 server/pyproject.toml(requires-python >=3.12, fastapi),
  whisper.cpp는 server/je_server/asr.py, Qwen3-TTS와 Tailscale은 README, Claude API는 server/pyproject.toml의 anthropic이다. 로고는 넣지 않는다.
- 그림은 src/lib/jake-english-images.ts에 있다. 이야기 4컷 칸, 연습하는 방법 칸, 장의 순서는 story, panels, chapters의 순서와 같다.
-->
