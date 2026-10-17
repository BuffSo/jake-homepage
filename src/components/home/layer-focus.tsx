"use client";

import { createContext, use, useCallback, useState, type ReactNode } from "react";
import type { Layer } from "@/lib/content";

// 기술 층 강조 (docs/04-motion.md 멈춘 뒤). 층과 서비스 목록이 화면의 다른 곳에 있어서 상태를 여기에 둔다.
// 마우스를 올리거나 키보드 포커스가 가면 잠깐 보여 준다. 터치와 키보드로 누르면 고정하고,
// 다시 누르거나 층 밖을 누르거나 Esc를 누르면 푼다(stack-layers.tsx).

type LayerFocus = {
  /** 지금 강조하는 층. 잠깐 보여 주는 층이 고정한 층보다 먼저다. */
  active: Layer | null;
  /** 눌러서 고정한 층 */
  pinned: Layer | null;
  toggle: (name: string) => void;
  preview: (name: string | null) => void;
  /** 고정한 층과 잠깐 보여 주는 층을 모두 지운다 */
  release: () => void;
};

const LayerFocusContext = createContext<LayerFocus | null>(null);

export function LayerFocusProvider({ layers, children }: { layers: Layer[]; children: ReactNode }) {
  const [pinnedName, setPinnedName] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const find = (name: string | null) => layers.find((layer) => layer.name === name) ?? null;
  // 층 목록이 document에 한 번 거는 리스너가 쓰므로 렌더마다 바뀌지 않게 고정한다.
  const release = useCallback(() => {
    setPinnedName(null);
    setPreviewName(null);
  }, []);

  const value: LayerFocus = {
    active: find(previewName ?? pinnedName),
    pinned: find(pinnedName),
    toggle: (name) => {
      // 키보드 포커스로 잠깐 보여 주던 층을 누르면, 누른 결과가 바로 보이게 미리 보기를 지운다.
      setPreviewName(null);
      setPinnedName((current) => (current === name ? null : name));
    },
    preview: setPreviewName,
    release,
  };

  return <LayerFocusContext value={value}>{children}</LayerFocusContext>;
}

export function useLayerFocus(): LayerFocus {
  const value = use(LayerFocusContext);
  if (!value) throw new Error("LayerFocusProvider 안에서만 씁니다");
  return value;
}
