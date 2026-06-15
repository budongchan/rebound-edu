"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function getInitialOption(options) {
  return options?.[0]?.id || "";
}

function getCompactPriceText(priceText) {
  const numeric = Number(String(priceText || "").replace(/[^\d]/g, ""));
  if (!numeric) return priceText;
  if (numeric % 10000 === 0) return `${numeric / 10000}만원`;
  return priceText;
}

export default function StickyEnrollmentBar({
  course,
  color = "#14110f",
  priceText = "",
}) {
  const options = course.scheduleOptions || [];
  const [selectedId, setSelectedId] = useState(getInitialOption(options));
  const selected = useMemo(
    () => options.find((option) => option.id === selectedId) || options[0],
    [options, selectedId]
  );

  const checkoutHref = selected
    ? `/checkout/${selected.courseId}${selected.checkoutQuery || ""}`
    : `/checkout/${course.id}`;
  const compactPriceText = getCompactPriceText(priceText);
  const ctaLabel = course.free ? "무료 신청" : compactPriceText ? `${compactPriceText} 수강하기` : "수강하기";
  const goCheckout = (event) => {
    event.preventDefault();
    window.location.href = checkoutHref;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="container-edu pointer-events-auto">
        <div className="rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_18px_50px_-20px_rgba(20,17,15,0.75)] ring-1 ring-white/10 lg:px-7">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(180px,1fr)]">
              {selected && (
                <select
                  value={selected.id}
                  onChange={(event) => setSelectedId(event.target.value)}
                  aria-label="수강 요일 선택"
                  className="h-14 rounded-xl border border-white/15 bg-white/10 px-4 text-[14px] font-black text-white outline-none transition-colors focus:border-white/45"
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id} className="text-ink">
                      {option.label} ({option.weekday})
                    </option>
                  ))}
                </select>
              )}
              <Link
                href={checkoutHref}
                onClick={goCheckout}
                className="flex h-14 items-center justify-center rounded-xl px-5 text-[16px] font-black text-white transition-transform hover:-translate-y-0.5"
                style={{ background: color }}
              >
                {ctaLabel}
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
