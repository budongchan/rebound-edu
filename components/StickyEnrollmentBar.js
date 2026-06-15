"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function getInitialOption(options) {
  return options?.[0]?.id || "";
}

export default function StickyEnrollmentBar({
  course,
  color = "#14110f",
  enrollmentStatus = "신청가능",
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
  const ctaLabel = course.free ? "무료 신청" : priceText ? `${priceText} 수강하기` : "수강하기";
  const statusText = course.free ? "지금 바로 수강 가능" : enrollmentStatus === "신청가능" ? "지금 바로 수강 가능" : enrollmentStatus;
  const benefitText = course.sidebarSummary?.[0] || course.scheduleShort || course.subtitle;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="container-edu pointer-events-auto">
        <div className="rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_18px_50px_-20px_rgba(20,17,15,0.75)] ring-1 ring-white/10 lg:px-7">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[16px] font-black leading-tight lg:text-[22px]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-[18px] text-red-400">
                  ●
                </span>
                {statusText}
              </p>
              <p className="mt-1 truncate text-[12px] font-semibold text-white/62 lg:text-[13px]">
                {benefitText}
              </p>
            </div>

            <div className="flex items-end justify-between gap-3 lg:min-w-[180px] lg:flex-col lg:justify-center lg:gap-0 lg:text-right">
              <div>
                <p className="text-[11px] font-bold text-white/50">수강료</p>
                <p className="text-[22px] font-black leading-none text-white lg:text-[24px]">
                  {priceText}
                </p>
              </div>
              {selected && (
                <p className="text-right text-[12px] font-bold text-white/58">
                  {selected.weekday} 선택
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,180px)_minmax(150px,1fr)] lg:min-w-[380px]">
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
                className="flex h-14 items-center justify-center rounded-xl px-5 text-[16px] font-black text-white transition-transform hover:-translate-y-0.5"
                style={{ background: color }}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
