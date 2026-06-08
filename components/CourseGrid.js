"use client";

import { useState, useMemo } from "react";
import CourseCard from "./CourseCard";
import { CATEGORIES } from "@/lib/courses";

const LEVELS = ["전체", "입문", "중급", "고급"];

export default function CourseGrid({ courses }) {
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("전체");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = courses;
    if (cat !== "all") list = list.filter((c) => c.category === cat);
    if (level !== "전체") list = list.filter((c) => c.level === level);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.tagline?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, cat, level, query]);

  return (
    <div>
      {/* 검색창 */}
      <div className="relative mb-5">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
          width="16" height="16" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="강의 검색 (AI, 중개, 호스텔…)"
          className="w-full rounded-xl border border-line bg-paper py-3 pl-10 pr-10 text-[14px] text-ink placeholder:text-ink-soft/40 focus:border-ink/40 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[20px] leading-none text-ink-soft/50 hover:text-ink"
          >
            ×
          </button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = cat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`rounded-full border px-4 py-2 text-[14px] font-bold transition-colors ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper text-ink-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 레벨 필터 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LEVELS.map((l) => {
          const on = level === l;
          return (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                on
                  ? "border-brand bg-brand/8 text-brand"
                  : "border-line bg-paper text-ink-soft/70 hover:border-brand/30 hover:text-brand"
              }`}
            >
              {l}
            </button>
          );
        })}
        <span className="ml-1 text-[12px] text-ink-soft/50">{filtered.length}개</span>
      </div>

      {/* 그리드 */}
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-[15px] font-semibold text-ink">검색 결과가 없습니다</p>
          <p className="mt-1 text-[13px] text-ink-soft">다른 키워드나 분류로 찾아보세요.</p>
          <button
            onClick={() => { setCat("all"); setLevel("전체"); setQuery(""); }}
            className="mt-4 rounded-xl border border-line px-5 py-2.5 text-[13px] font-bold text-ink-soft hover:text-ink"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
