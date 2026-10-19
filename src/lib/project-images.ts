// 서비스 화면 캡처. 홈 카드는 처음 보는 사람이 알아볼 화면을, /work 챕터는 기능이 보이는 화면을 쓴다.
// 어디서 어떻게 찍었고 무엇을 피했는지는 docs/02-ia.md 홈 2의 화면 열과 각 content/site/projects/*.md 주석에 있다.
import type { StaticImageData } from "next/image";
import lotto from "@/assets/home/lotto.png";
import prowithCard from "@/assets/home/prowith-card.png";
import prowith from "@/assets/home/prowith.png";
import recueveCard from "@/assets/home/recueve-card.jpg";
import recueve from "@/assets/home/recueve.png";
import type { ProjectSlug } from "./content";

/** /work 챕터의 캡처 */
export const PROJECT_IMAGES: Record<ProjectSlug, StaticImageData> = { recueve, prowith, "lotto-ai": lotto };

/** 홈 "운영 중인 서비스" 카드의 캡처 */
export const CARD_IMAGES: Record<ProjectSlug, StaticImageData> = {
  recueve: recueveCard,
  prowith: prowithCard,
  "lotto-ai": lotto,
};
