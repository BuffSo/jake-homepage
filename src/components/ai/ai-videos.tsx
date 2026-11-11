import Image, { type StaticImageData } from "next/image";
import { ButtonLink } from "@/components/button-link";
import { Metric } from "@/components/section-head";
import type { AiVideo } from "@/lib/content";

// /ai "영상 제작" 항목의 영상 목록 (docs/02-ia.md /ai, docs/03-design.md F3).
// 데스크톱은 두 칸씩 나란히 놓고 셋째부터 다음 줄로 넘긴다. 모바일은 위아래로 쌓는다.
// 영상을 더할 때 코드를 고치지 않게, 썸네일은 글(content/site/ai/video.md)에 적은 경로로 찾는다.
// src/assets 아래 그림을 빌드할 때 한꺼번에 불러 두는 것은 Turbopack의 import.meta.glob이다.
// { import: "default" } 옵션은 개발 서버에서는 되지만 next build에서는 값이 모두 undefined였다(Next.js 16.4.2).
// 그래서 모듈째 불러 default를 직접 꺼낸다 (docs/guide/CONTENT_AI_사례_20261020.md).
const MODULES = import.meta.glob<{ default: StaticImageData }>(["/src/assets/**/*.jpg", "/src/assets/**/*.png"], {
  eager: true,
});

/** 글의 경로(src/assets/…)로 그림을 찾는다. 없으면 빌드가 멈춘다. */
function thumbnail(file: string): StaticImageData {
  const image = MODULES[`/${file}`]?.default;
  if (!image) throw new Error(`영상 썸네일이 없습니다: ${file}`);
  return image;
}

export function AiVideos({ videos }: { videos: AiVideo[] }) {
  return (
    <ul className="grid grid-cols-1 gap-y-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12">
      {videos.map((video) => (
        // 숫자와 버튼은 mt-auto로 칸 아래에 붙여, 같은 줄의 칸끼리 글 길이가 달라도 나란히 보이게 한다.
        <li key={video.link.href} className="flex flex-col gap-3 lg:gap-3.5">
          <Image
            src={thumbnail(video.thumbnail)}
            alt={video.thumbnailAlt}
            sizes="(min-width: 80rem) 35rem, (min-width: 64rem) 45vw, 100vw"
            className="aspect-video w-full rounded-[0.625rem] border border-line object-cover lg:rounded-xl"
          />
          <h4 className="mt-1 text-[1.1875rem] font-bold lg:text-[1.375rem]">{video.title}</h4>
          <p className="text-sm leading-[1.65] lg:text-[0.9375rem]">{video.built}</p>
          <div className="mt-auto flex flex-col gap-3 pt-1 lg:gap-3.5">
            <Metric {...video.metric} />
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={video.link.href} variant="solid">
                {video.link.label}
              </ButtonLink>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
