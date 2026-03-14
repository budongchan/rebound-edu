"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_LABELS } from "@/types";
import { Star, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface CourseWithInstructor {
  id: string;
  title: string;
  subtitle: string | null;
  price: number;
  discount_price: number | null;
  category: string;
  difficulty: string | null;
  total_lectures: number;
  total_duration_sec: number;
  thumbnail_url: string | null;
  instructor: { name: string } | null;
  avg_rating: number;
  review_count: number;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "고급",
};

const GRADIENT_COLORS: Record<string, string> = {
  vacancy: "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  brokerage: "linear-gradient(135deg,#228be6,#4dabf7)",
  hostel: "linear-gradient(135deg,#40c057,#69db7c)",
  ai_automation: "linear-gradient(135deg,#7950f2,#9775fa)",
  investment: "linear-gradient(135deg,#fd7e14,#ffa94d)",
  other: "linear-gradient(135deg,#868e96,#adb5bd)",
};

export default function ExplorePage() {
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("courses")
        .select(`
          id, title, subtitle, price, discount_price, category, difficulty,
          total_lectures, total_duration_sec, thumbnail_url,
          instructor:users!courses_instructor_id_fkey(name)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data: coursesData } = await query;

      if (coursesData) {
        // Get review stats
        const courseIds = coursesData.map((c) => c.id);
        const { data: reviews } = await supabase
          .from("reviews")
          .select("course_id, rating")
          .in("course_id", courseIds);

        const reviewMap: Record<string, { sum: number; count: number }> = {};
        reviews?.forEach((r) => {
          if (!reviewMap[r.course_id]) reviewMap[r.course_id] = { sum: 0, count: 0 };
          reviewMap[r.course_id].sum += r.rating;
          reviewMap[r.course_id].count += 1;
        });

        const enriched = coursesData.map((c) => ({
          ...c,
          instructor: Array.isArray(c.instructor) ? c.instructor[0] : c.instructor,
          avg_rating: reviewMap[c.id] ? reviewMap[c.id].sum / reviewMap[c.id].count : 0,
          review_count: reviewMap[c.id]?.count || 0,
        }));

        setCourses(enriched);
      }
      setLoading(false);
    };
    load();
  }, [category, search]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="강의명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              category === cat.value
                ? "bg-brand text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">강의가 없습니다</p>
          <p className="text-sm">다른 카테고리를 선택해보세요</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{courses.length}개의 강의</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/student/explore/${course.id}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="h-[140px] flex items-center justify-center"
                  style={{
                    background: course.thumbnail_url
                      ? `url(${course.thumbnail_url}) center/cover`
                      : GRADIENT_COLORS[course.category] || GRADIENT_COLORS.other,
                  }}
                >
                  {!course.thumbnail_url && (
                    <span className="text-white/80 text-sm font-medium">
                      {CATEGORY_LABELS[course.category] || "기타"}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex gap-1 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </span>
                    {course.difficulty && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {course.instructor?.name || "강사"} · 총 {course.total_lectures}강
                  </p>
                  {course.review_count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i <= Math.floor(course.avg_rating) ? "#FFB800" : "none"}
                          stroke="#FFB800"
                          strokeWidth={2}
                        />
                      ))}
                      <span className="text-[11px] text-gray-400 ml-1">
                        ({course.review_count})
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    {course.discount_price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₩{formatPrice(course.price)}
                      </span>
                    )}
                    <span className="text-[15px] font-bold text-gray-900">
                      ₩{formatPrice(course.discount_price || course.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
