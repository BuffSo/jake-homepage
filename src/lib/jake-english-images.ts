// Jake English 그림 (/ai 맨 위 띠, /ai/jake-english). 이야기 4컷을 뺀 그림은 공개한 소개 영상에서 가져왔다.
// 썸네일은 영상 썸네일 그대로, 연습하는 방법 4컷은 시연 영상의 폰 화면에 단계와 제목과 말풍선을 HTML로 다시 그려 찍은 것,
// 이야기 4컷은 Gemini 앱으로 그린 그림이고 띠에서도 작게 쓴다. 슬라이드는 영상 슬라이드의 글과 색을 그대로 두고,
// 사이트 폭에서 글자가 읽히게 칸과 글자 크기만 바꿔 데스크톱 판과 모바일 판으로 다시 찍은 것이다(제목 줄은 뺌).
// 만든 방법과 크기는 docs/guide/CONTENT_AI_사례_20261020.md에 있다.
import type { StaticImageData } from "next/image";
import flow1 from "@/assets/ai/jake-english/flow-1.jpg";
import flow2 from "@/assets/ai/jake-english/flow-2.jpg";
import flow3 from "@/assets/ai/jake-english/flow-3.jpg";
import flow4 from "@/assets/ai/jake-english/flow-4.jpg";
import slide1Mobile from "@/assets/ai/jake-english/slide-1-mobile.jpg";
import slide1 from "@/assets/ai/jake-english/slide-1.jpg";
import slide2Mobile from "@/assets/ai/jake-english/slide-2-mobile.jpg";
import slide2 from "@/assets/ai/jake-english/slide-2.jpg";
import slide3Mobile from "@/assets/ai/jake-english/slide-3-mobile.jpg";
import slide3 from "@/assets/ai/jake-english/slide-3.jpg";
import slide4Mobile from "@/assets/ai/jake-english/slide-4-mobile.jpg";
import slide4 from "@/assets/ai/jake-english/slide-4.jpg";
import story1 from "@/assets/ai/jake-english/story-1.jpg";
import story2 from "@/assets/ai/jake-english/story-2.jpg";
import story3 from "@/assets/ai/jake-english/story-3.jpg";
import story4 from "@/assets/ai/jake-english/story-4.jpg";
import video from "@/assets/ai/jake-english/video.jpg";

/** 소개 영상의 썸네일 (1920×1080) */
export const VIDEO_THUMB: StaticImageData = video;

/** 연습하는 방법 4컷, 칸 순서는 첫 화면, 상황 정하기, 본보기를 듣고 말하기, 자유 대화 (1280×720). content/site/jake-english.md의 panels와 순서가 같다 */
export const FLOW_IMAGES: StaticImageData[] = [flow1, flow2, flow3, flow4];

/** 이야기 4컷, 칸 순서 (1200×1200). 페이지 첫 절과 /ai 맨 위 띠가 같이 쓴다. content/site/jake-english.md의 story와 순서가 같다 */
export const STORY_IMAGES: StaticImageData[] = [story1, story2, story3, story4];

/** 본문 1~4장의 슬라이드 한 장. 데스크톱 판은 가로로 넓고(1440 폭), 모바일 판은 같은 글을 좁은 폭에 맞게 다시 짰다(960 폭) */
export type SlideImage = { desktop: StaticImageData; mobile: StaticImageData };

/** 본문 1~4장의 슬라이드. 5장은 그림 대신 숫자다 */
export const SLIDE_IMAGES: SlideImage[] = [
  { desktop: slide1, mobile: slide1Mobile },
  { desktop: slide2, mobile: slide2Mobile },
  { desktop: slide3, mobile: slide3Mobile },
  { desktop: slide4, mobile: slide4Mobile },
];
