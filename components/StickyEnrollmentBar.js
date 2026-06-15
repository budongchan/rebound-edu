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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
      <div className="container-edu">
        <div className="rounded-2xl bg-ink p-3 text-white shadow-[0_18px_50px_-20px_rgba(20,17,15,0.75)] ring-1 ring-white/10 lg:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              {selected && options.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:w-[360px] sm:shrink-0">
                  {options.map((option) => {
                    const active = option.id === selected.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedId(option.id)}
                        aria-pressed={active}
                        className={[
                          "flex min-h-14 flex-col items-center justify-center rounded-xl border px-3 text-center transition-colors",
                          active
                            ? "border-white bg-white text-ink"
                            : "border-white/15 bg-white/10 text-white hover:bg-white/15",
                        ].join(" ")}
                      >
                        <span className="text-[14px] font-black leading-tight">{option.label}</span>
                        <span className={`mt-0.5 text-[12px] font-extrabold leading-tight ${active ? "text-ink-soft" : "text-white/70"}`}>
                          {option.weekday}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <Link
                href={checkoutHref}
                onClick={goCheckout}
                className="flex min-h-14 flex-1 items-center justify-center rounded-xl px-5 text-[16px] font-black text-white transition-transform hover:-translate-y-0.5"
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
