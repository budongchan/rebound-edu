"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function ScheduleCheckoutSelector({ options = [], color = "#14110f", compact = false, priceText = "" }) {
  const initialId = options[0]?.id || "";
  const [selectedId, setSelectedId] = useState(initialId);
  const selected = useMemo(
    () => options.find((option) => option.id === selectedId) || options[0],
    [options, selectedId]
  );

  if (!options.length || !selected) return null;
  const checkoutHref = `/checkout/${selected.courseId}${selected.checkoutQuery || ""}`;

  if (compact) {
    return (
      <div className="flex w-full items-center gap-2">
        <select
          value={selected.id}
          onChange={(event) => setSelectedId(event.target.value)}
          aria-label="수강 요일 선택"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-3 text-[13px] font-extrabold text-ink outline-none"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} ({option.weekday})
            </option>
          ))}
        </select>
        <Link
          href={checkoutHref}
          className="shrink-0 rounded-xl px-4 py-3 text-[13px] font-black text-white"
          style={{ background: color }}
        >
          {priceText ? `${priceText} 신청하기` : "신청하기"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-line bg-cream/45 p-4">
      <p className="text-[13px] font-extrabold text-ink">수강 요일 선택</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option.id === selected.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              className="rounded-xl border px-3 py-3 text-left transition-colors"
              style={{
                borderColor: active ? color : "var(--c-line)",
                background: active ? `${color}12` : "var(--c-paper)",
              }}
            >
              <span className="block text-[14px] font-black text-ink">{option.label}</span>
              <span className="mt-0.5 block text-[12px] font-bold text-ink-soft">{option.weekday}</span>
            </button>
          );
        })}
      </div>

      <dl className="mt-4 space-y-2 text-[12px]">
        {selected.theorySchedule && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-soft">» 이론수업</dt>
            <dd className="text-right font-extrabold text-ink">{selected.theorySchedule}</dd>
          </div>
        )}
        {!selected.theorySchedule && selected.schedule && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-soft">» 이론수업</dt>
            <dd className="text-right font-extrabold text-ink">{selected.schedule.split('·')[0]?.trim()}</dd>
          </div>
        )}
        {selected.fieldworkSchedule && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-soft">임장수업</dt>
            <dd className="text-right font-extrabold text-ink">{selected.fieldworkSchedule}</dd>
          </div>
        )}
        {!selected.fieldworkSchedule && selected.schedule?.includes('·') && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-soft">임장수업</dt>
            <dd className="text-right font-extrabold text-ink">{selected.schedule.split('·')[1]?.trim()}</dd>
          </div>
        )}
      </dl>

      <Link
        href={checkoutHref}
        className="mt-4 block rounded-xl px-5 py-4 text-center text-[15px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
        style={{ background: color, boxShadow: `0 8px 24px -8px ${color}80` }}
      >
        {priceText ? `${priceText} 수강 신청하기` : "수강 신청하기"}
      </Link>
      <p className="mt-2.5 text-center text-[12px] text-ink-soft/70">
        선택한 요일 기준으로 결제 안내가 열립니다.
      </p>
    </div>
  );
}
