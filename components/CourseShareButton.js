"use client";

import { useState } from "react";

export default function CourseShareButton({ title, summary, color = "#14110f", variant = "light" }) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: `${title} | 리바운드에듀`,
      text: summary || `${title} 수업 상세 페이지`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setMessage("공유창을 열었습니다.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("링크를 복사했습니다.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setMessage("링크 복사에 실패했습니다.");
    }
  }

  const isDark = variant === "dark";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleShare}
        className={
          isDark
            ? "rounded-xl border border-white/25 bg-white/12 px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-white/18"
            : "rounded-xl border border-line bg-paper px-4 py-2.5 text-[13px] font-black text-ink transition-colors hover:bg-cream"
        }
        style={isDark ? undefined : { color }}
      >
        공유하기
      </button>
      {message && (
        <span className={isDark ? "text-[11px] font-semibold text-white/70" : "text-[11px] font-semibold text-ink-soft"}>
          {message}
        </span>
      )}
    </div>
  );
}
