"use client";

import { useState } from "react";
import CourseCard from "./CourseCard";
import { CATEGORIES } from "@/lib/courses";

export default function CourseGrid({ courses }) {
  const [active, setActive] = useState("all");
  const filtered =
    active === "all" ? courses : courses.filter((c) => c.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const on = active === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`rounded-full border px-4 py-2 text-[14px] font-bold transition-colors ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper text-ink-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-ink-soft">해당 분야의 강의가 곧 공개됩니다.</p>
      )}
    </div>
  );
}
