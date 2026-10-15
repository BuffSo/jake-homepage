// 서비스 화면 캡처. 홈 카드와 /work 챕터가 같은 캡처를 쓴다.
// 무엇을 피해 찍었는지는 docs/02-ia.md 홈 2의 화면 열에 있다.
import type { StaticImageData } from "next/image";
import lotto from "@/assets/home/lotto.png";
import prowith from "@/assets/home/prowith.png";
import recueve from "@/assets/home/recueve.png";
import type { ProjectSlug } from "./content";

export const PROJECT_IMAGES: Record<ProjectSlug, StaticImageData> = { recueve, prowith, "lotto-ai": lotto };
