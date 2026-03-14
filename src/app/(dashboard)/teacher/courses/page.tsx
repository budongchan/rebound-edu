"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

interface TeacherCourse {
  id: string;
  title: string;
  status: string;
  category: string;
  price: number;
  discount_price: number | null;
  total_lectures: number;
  created_at: string;
  published_at: string | null;
  studentCount: number;
  avgRating: number;
  reviewCount: number;
}

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "amber" | "gray" | "red" }> = {
  published: { label: "공개중", color: "green" },
  approved: { label: "승인됨", color: "blue" },
  review: { label: "검토중", color: "amber" },
  revision: { label: "수정요청", color: "red" },
  draft: { label: "초안", color: "gray" },
  archived: { label: "보관", color: "gray" },
};

const STATUS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "published", label: "공개중" },
  { value: "draft", label: "초안" },
  { value: "review", label: "검토중" },
  { value: "archived", label: "보관" },
];

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, status, category, price, discount_price, total_lectures, created_at, published_at")
        .eq("instructor_id", profile.id)
        .order("created_at", { ascending: false });

      if (!coursesData) { setLoading(false); return; }

      const courseIds = coursesData.map((c) => c.id);

      // Enrollment counts
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds);

      const countMap: Record<string, number> = {};
      enrollments?.forEach((e) => {
        countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
      });

      // Review stats
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

      setCourses(
        coursesData.map((c) => ({
          ...c,
          studentCount: countMap[c.id] || 0,
          avgRating: reviewMap[c.id] ? reviewMap[c.id].sum / reviewMap[c.id].count : 0,
          reviewCount: reviewMap[c.id]?.count || 0,
        }))
      );
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === "all" ? courses : courses.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">강의 관리</h2>
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
        >
          <Plus size={16} />
          새 강의
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.value
                ? "bg-brand text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({courses.filter((c) => c.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Course list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">강의가 없습니다</p>
          <p className="text-sm text-gray-300">새 강의를 만들어보세요</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
            return (
              <Link
                key={c.id}
                href={`/teacher/courses/new?edit=${c.id}`}
                className="block bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-semibold text-gray-900">{c.title}</h3>
                      <Badge color={st.color}>{st.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {CATEGORY_LABELS[c.category] || c.category} · {c.total_lectures}강 · ₩{formatPrice(c.discount_price || c.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>수강생 {c.studentCount}명</span>
                  {c.reviewCount > 0 && (
                    <span>평점 {c.avgRating.toFixed(1)} ({c.reviewCount})</span>
                  )}
                  <span>
                    {c.published_at
                      ? `공개일 ${formatDate(c.published_at)}`
                      : `생성일 ${formatDate(c.created_at)}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
