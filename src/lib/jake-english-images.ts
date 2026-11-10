// Jake English 그림 (/ai 맨 위 띠, /ai/jake-english). 모두 공개한 소개 영상에서 가져왔다.
// 썸네일은 영상 썸네일 그대로, 4컷은 시연 영상의 폰 화면에 단계와 제목과 말풍선을 HTML로 다시 그려 찍은 것,
// 띠 작은 그림은 4컷 칸의 폰 화면을 정사각형으로 자른 것, 슬라이드는 영상 슬라이드에서 제목 줄을 잘라 낸 것이다.
// 만든 방법과 크기는 docs/guide/CONTENT_AI_사례_20261020.md에 있다.
import type { StaticImageData } from "next/image";
import entry1 from "@/assets/ai/jake-english/entry-1.jpg";
import entry2 from "@/assets/ai/jake-english/entry-2.jpg";
import entry3 from "@/assets/ai/jake-english/entry-3.jpg";
import entry4 from "@/assets/ai/jake-english/entry-4.jpg";
import flow1 from "@/assets/ai/jake-english/flow-1.jpg";
import flow2 from "@/assets/ai/jake-english/flow-2.jpg";
import flow3 from "@/assets/ai/jake-english/flow-3.jpg";
import flow4 from "@/assets/ai/jake-english/flow-4.jpg";
import slide1 from "@/assets/ai/jake-english/slide-1.jpg";
import slide2 from "@/assets/ai/jake-english/slide-2.jpg";
import slide3 from "@/assets/ai/jake-english/slide-3.jpg";
import slide4 from "@/assets/ai/jake-english/slide-4.jpg";
import video from "@/assets/ai/jake-english/video.jpg";

/** 소개 영상의 썸네일 (1920×1080) */
export const VIDEO_THUMB: StaticImageData = video;

/** 연습 흐름 4컷, 칸 순서 (1280×720). content/site/jake-english.md의 panels와 순서가 같다 */
export const FLOW_IMAGES: StaticImageData[] = [flow1, flow2, flow3, flow4];

/** /ai 맨 위 띠의 작은 그림, 4컷 칸 순서 (462×462) */
export const ENTRY_IMAGES: StaticImageData[] = [entry1, entry2, entry3, entry4];

/** 본문 1~4장의 슬라이드 (1560×690). 5장은 그림 대신 숫자다 */
export const SLIDE_IMAGES: StaticImageData[] = [slide1, slide2, slide3, slide4];
