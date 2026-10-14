"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { Layer } from "@/lib/content";

// 기술 층 강조 (docs/04-motion.md 멈춘 뒤). 층과 서비스 목록이 화면의 다른 곳에 있어서 상태를 여기에 둔다.
// 누르면 고정하고 다시 누르면 푼다. 마우스를 올리거나 키보드 포커스가 가면 잠깐 보여 준다.

type LayerFocus = {
  /** 지금 강조하는 층. 잠깐 보여 주는 층이 고정한 층보다 먼저다. */
  active: Layer | null;
  /** 눌러서 고정한 층 */
  pinned: Layer | null;
  toggle: (name: string) => void;
  preview: (name: string | null) => void;
};

const LayerFocusContext = createContext<LayerFocus | null>(null);

export function LayerFocusProvider({ layers, children }: { layers: Layer[]; children: ReactNode }) {
  const [pinnedName, setPinnedName] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const find = (name: string | null) => layers.find((layer) => layer.name === name) ?? null;

  const value: LayerFocus = {
    active: find(previewName ?? pinnedName),
    pinned: find(pinnedName),
    toggle: (name) => {
      // 누른 뒤에는 마우스가 그대로 있어도 누른 결과가 바로 보이게 미리 보기를 지운다.
      setPreviewName(null);
      setPinnedName((current) => (current === name ? null : name));
    },
    preview: setPreviewName,
  };

  return <LayerFocusContext value={value}>{children}</LayerFocusContext>;
}

export function useLayerFocus(): LayerFocus {
  const value = use(LayerFocusContext);
  if (!value) throw new Error("LayerFocusProvider 안에서만 씁니다");
  return value;
}
