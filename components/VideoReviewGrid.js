"use client";

import { useState, useEffect } from "react";

export default function VideoReviewGrid({ videos = [], color = "#14110f" }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!videos.length) return null;

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(v)}
            className="group overflow-hidden rounded-xl border border-line bg-cream/40 text-left transition-colors hover:bg-cream"
          >
            <div className="relative aspect-video bg-ink">
              <img
                src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                alt={`${v.title} 후기 영상 썸네일`}
                loading="lazy"
                className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 shadow">
                  <span
                    className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent"
                    style={{ borderLeftColor: color }}
                  />
                </span>
              </span>
            </div>
            <p className="p-2.5 text-[12px] font-bold leading-snug text-ink">{v.title}</p>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-9 right-0 text-[14px] font-bold text-white"
              aria-label="닫기"
            >
              ✕ 닫기
            </button>
            <div className="overflow-hidden rounded-xl bg-ink shadow-2xl">
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-center text-[13px] font-bold text-white">{active.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
