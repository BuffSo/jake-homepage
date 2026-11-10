// Jake English 그림 (/ai 맨 위 띠, /ai/jake-english). 모두 공개한 소개 영상에서 가져왔다.
// 썸네일은 영상 썸네일 그대로, 연습 흐름 4컷은 시연 영상의 폰 화면에 단계와 제목과 말풍선을 HTML로 다시 그려 찍은 것,
// 4컷 만화는 Gemini 앱으로 그린 그림이고 띠에서도 작게 쓴다. 슬라이드는 영상 슬라이드에서 제목 줄을 잘라 낸 것이다.
// 만든 방법과 크기는 docs/guide/CONTENT_AI_사례_20261020.md에 있다.
import type { StaticImageData } from "next/image";
import comic1 from "@/assets/ai/jake-english/comic-1.jpg";
import comic2 from "@/assets/ai/jake-english/comic-2.jpg";
import comic3 from "@/assets/ai/jake-english/comic-3.jpg";
import comic4 from "@/assets/ai/jake-english/comic-4.jpg";
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

/** 4컷 만화, 칸 순서 (1200×1200). 페이지 첫 절과 /ai 맨 위 띠가 같이 쓴다. content/site/jake-english.md의 comic과 순서가 같다 */
export const COMIC_IMAGES: StaticImageData[] = [comic1, comic2, comic3, comic4];

/** 본문 1~4장의 슬라이드 (1560×690). 5장은 그림 대신 숫자다 */
export const SLIDE_IMAGES: StaticImageData[] = [slide1, slide2, slide3, slide4];
