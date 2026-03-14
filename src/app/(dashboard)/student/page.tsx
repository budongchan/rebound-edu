"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface EnrollmentWithCourse {
  id: string;
  status: string;
  progress_pct: number;
  course: {
    id: string;
    title: string;
    total_lectures: number;
    category: string;
    instructor: { name: string } | null;
  } | null;
}

interface RecommendedCourse {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  total_lectures: number;
  instructor: { name: string } | null;
}

const STATUS_MAP: Record<string, { label: string; color: "blue" | "green" | "gray" | "red" }> = {
  active: { label: "수강중", color: "blue" },
  completed: { label: "완강", color: "green" },
  expired: { label: "만료", color: "gray" },
  refunded: { label: "환불", color: "red" },
};

const GRADIENT: Record<string, string> = {
  vacancy: "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  brokerage: "linear-gradient(135deg,#228be6,#4dabf7)",
  hostel: "linear-gradient(135deg,#40c057,#69db7c)",
  ai_automation: "linear-gradient(135deg,#7950f2,#9775fa)",
  investment: "linear-gradient(135deg,#fd7e14,#ffa94d)",
};

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [recommended, setRecommended] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      // My enrollments
      const { data: enrs } = await supabase
        .from("enrollments")
        .select(`
          id, status, progress_pct,
          course:courses(id, title, total_lectures, category,
            instructor:users!courses_instructor_id_fkey(name))
        `)
        .eq("user_id", profile.id)
        .order("enrolled_at", { ascending: false });

      const parsed = (enrs || []).map((e) => {
        const rawCourse = Array.isArray(e.course) ? e.course[0] : e.course;
        if (!rawCourse) return { ...e, course: null };
        const instructor = Array.isArray(rawCourse.instructor)
          ? rawCourse.instructor[0] ?? null
          : rawCourse.instructor;
        return { ...e, course: { ...rawCourse, instructor } };
      });
      setEnrollments(parsed);

      // Recommended courses (not enrolled)
      const enrolledIds = parsed.filter((e) => e.course).map((e) => e.course!.id);
      let q = supabase
        .from("courses")
        .select(`id, title, price, discount_price, category, total_lectures,
          instructor:users!courses_instructor_id_fkey(name)`)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      if (enrolledIds.length > 0) {
        q = q.not("id", "in", `(${enrolledIds.join(",")})`);
      }
      const { data: recs } = await q;
      setRecommended((recs || []).map((r) => ({
        ...r,
        instructor: Array.isArray(r.instructor) ? r.instructor[0] : r.instructor,
      })));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-3.5">수강 중인 강의</h2>
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center mb-7">
          <p className="text-gray-400 mb-3">수강 중인 강의가 없습니다</p>
          <Link
            href="/student/explore"
            className="inline-block px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
          >
            강의 탐색하기
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 mb-7">
          {enrollments.map((e) => {
            if (!e.course) return null;
            const st = STATUS_MAP[e.status] || STATUS_MAP.active;
            const done = Math.round((e.progress_pct / 100) * e.course.total_lectures);
            return (
              <Link
                key={e.id}
                href={`/student/explore/${e.course.id}`}
                className="block bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                      {e.course.title}
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      {e.course.instructor?.name || "강사"} · 총 {e.course.total_lectures}강
                    </p>
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        e.progress_pct === 100 ? "bg-green-500" : "bg-brand"
                      }`}
                      style={{ width: `${e.progress_pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 min-w-[70px] text-right">
                    {done}/{e.course.total_lectures}강 ({e.progress_pct}%)
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {recommended.length > 0 && (
        <>
          <h2 className="text-base font-bold mb-3.5">추천 강의</h2>
          <div className="grid grid-cols-2 gap-3">
            {recommended.map((c) => (
              <Link
                key={c.id}
                href={`/student/explore/${c.id}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="h-[100px] flex items-center justify-center"
                  style={{ background: GRADIENT[c.category] || GRADIENT.vacancy }}
                >
                  <span className="text-white/80 text-xs font-medium">
                    {CATEGORY_LABELS[c.category] || c.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1.5">
                    {c.instructor?.name || "강사"} · {c.total_lectures}강
                  </p>
                  <span className="text-sm font-bold text-gray-900">
                    ₩{(c.discount_price || c.price).toLocaleString("ko-KR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
