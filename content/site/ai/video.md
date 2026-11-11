---
slug: video
order: 6
group: beyond
home: 2
eyebrow: VIDEO · 영상 제작
title: 영상 제작
headline: 편집 도구를 직접 다루지 않고도 영상을 만듭니다.
desc: Recueve 영상은 computer use로 에이전트에게 CapCut을 조작하게 해서 만들었습니다. Jake English 영상은 대본 초안과 HTML 슬라이드, 자막을 AI로 만들고, 말하는 진행자는 클라우드 GPU에서 영상 생성 모델을 돌려 만들었습니다.
problem: 영상이 필요했지만 편집 도구를 다뤄 본 적이 없었습니다.
metric:
  value: 영상 2편 · 1080p
  label: 유튜브에 공개한 완성본
figure: videos
links: []
videos:
  - order: 1
    title: Recueve 소개 영상
    thumbnail: src/assets/home/video.jpg
    thumbnailAlt: Recueve 소개 영상의 썸네일
    built: 대본, 자막, 나레이션, 음악 배치를 정하면 computer use로 에이전트가 CapCut에서 나레이션을 만들고, ffmpeg로 자막, 전환, 음악을 조립합니다. 저는 말투와 음악이 나레이션을 덮는지 듣고 판단했고, 음악은 AI가 추천한 곳에서 유튜브용 라이선스를 확인해 선정했습니다.
    metric:
      value: 71.9초 · 6장면 · 1080p
      label: 완성본
    link:
      label: 영상 보기
      href: https://www.youtube.com/watch?v=l8j7xHA2hTA
  - order: 2
    title: Jake English 소개 영상
    thumbnail: src/assets/ai/jake-english/video.jpg
    thumbnailAlt: Jake English 소개 영상의 썸네일
    built: 에이전트가 대본 초안과 HTML 슬라이드, 자막을 만들고 앱 시연 영상과 이어 붙였습니다. 진행자가 말하는 장면은 클라우드 GPU에서 영상 생성 모델을 돌려 만들었습니다. 저는 대본을 문장마다 고치고, 완성본을 보며 고칠 곳을 찾았습니다.
    metric:
      value: 3분 17초 · 1080p
      label: 완성본
    link:
      label: 영상 보기
      href: https://www.youtube.com/watch?v=5FByJLa8R1k
sources:
  - 71.9초 · 1080p · 6장면
  - computer use로 에이전트가 영상 편집 도구를 직접 조작
---

<!--
영상 제작 항목이다. 영상은 videos에 한 편씩 두고, order 순서로 /ai에 그린다.
- 영상을 더할 때는 videos에 한 덩이를 더하고 썸네일 그림을 src/assets 아래에 둔다. 코드는 고치지 않는다(src/lib/asset-images.ts가 경로로 찾는다).
- 공개한 영상만 넣는다.
- 항목의 desc, metric, figure는 홈 AI 카드에만 쓴다. 홈 카드에는 바깥 링크를 두지 않아 links는 비운다.
- 홈 카드 그림은 videos의 마지막 두 편을 같은 크기로 겹치고, 앞선 편(먼저 만든 Recueve)을 뒤에 둔다. 나중 영상이 더 나아간 것이 차례로 보이게 한 것이다(2026-11-11 사용자).
- 홈 카드 설명은 두 영상을 이름으로 말하고, 숫자는 편수를 말한다. 영상을 더하면 둘을 함께 고친다(내용 시험이 편수를 본다). 홈 카드에는 영상 길이를 쓰지 않는다.

Recueve 소개 영상
- 공개된 유튜브 영상이다. 무엇에 제출한 영상인지는 쓰지 않는다.
- 만든 방법은 포트폴리오 "2. AI 활용 - 개발 > 코드 작성 외의 일"에 있다. sources는 원문과 대조한다.

Jake English 소개 영상
- 사이트 전용 글이다. 이력서와 포트폴리오에는 없다(ADR-0003). 2026-11-11 본인 확인.
- 제목(Jake English 소개 | 영어 말하기 연습 앱), 길이 3분 17초, 크기 1920×1080은 공개한 유튜브 영상에서 확인했다.
- 만든 방법은 본인이 확인해 준 범위만 쓴다. 에이전트가 대본 초안, HTML 슬라이드, 자막을 만들고 앱 시연 영상과 이어 붙였고, 본인은 대본을 문장마다 고치고 완성본을 보며 고칠 곳을 찾았다.
- 진행자가 말하는 장면은 클라우드 GPU 서비스에서 영상 생성 모델을 돌려 만들었다. 근거는 영상을 만든 작업 기록(이 저장소 밖)의 캐릭터 영상 단계이고, 2026-11-11 본인 확인. 서비스 이름과 모델 이름은 쓰지 않는다.
- 썸네일은 /ai/jake-english가 쓰는 그림을 그대로 쓴다(src/lib/jake-english-images.ts).
-->
