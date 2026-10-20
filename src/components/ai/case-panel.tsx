import Image from "next/image";
import { panelBox } from "@/lib/ai-case.mjs";
import type { AiCasePanel } from "@/lib/content";
import comic from "../../../content/synced/ai-case.png";

// AI 도구 활용 사례의 4컷 한 칸 (docs/03-design.md AI 사례).
// 원본 그림 한 장을 칸 비율의 상자 안에 % 위치로 놓아 그 칸만 보이게 자른다. 칸마다 같은 그림 주소라 요청은 한 번이다.
// sizes는 그림 전체의 폭이다. 칸 폭의 약 2.26배(1024/454)가 된다.
// 그림은 장식이 아니지만 칸의 뜻은 바로 아래 설명이 말하므로 대체 텍스트를 비운다(쓰는 쪽에서 figcaption이나 링크 이름으로 읽힌다).
export function CasePanel({
  crop,
  sizes,
  className = "",
  eager = false,
}: {
  crop: AiCasePanel["crop"];
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  const box = panelBox(crop, comic);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: box.aspectRatio }}>
      <Image
        src={comic}
        alt=""
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="absolute max-w-none"
        style={{ width: box.width, height: box.height, left: box.left, top: box.top }}
      />
    </div>
  );
}
