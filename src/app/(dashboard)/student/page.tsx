"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface EnrollmentWithCourse {
  id: string;
  status: string;
  progress_pct: number;
  course: {
    id: string;
    title: string;
    total_lectures: number;
    category: string;
    kakao_chat_url: string | null;
    instructor: { name: string } | null;
  } | null;
}


const STATUS_MAP: Record<string, { label: string; color: "blue" | "green" | "gray" | "red" }> = {
  active: { label: "수강중", color: "blue" },
  completed: { label: "완강", color: "green" },
  expired: { label: "만료", color: "gray" },
  refunded: { label: "환불", color: "red" },
};


export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
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
          course:courses(id, title, total_lectures, category, kakao_chat_url,
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.course.kakao_chat_url && (
                    <a
                      href={e.course.kakao_chat_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FEE500] text-[#391B1B] font-semibold text-xs hover:bg-[#F5DD00] transition"
                    >
                      <MessageCircle size={14} />
                      수강생 단톡방
                    </a>
                  )}
                  {e.course.category === "ai_automation" && (
                    <>
                      <a
                        href="https://meet.google.com/ork-ftyi-zab"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(ev) => ev.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white font-semibold text-xs hover:bg-blue-600 transition"
                      >
                        🌐 온라인 강의장
                      </a>
                      <a
                        href="https://naver.me/GWiET7cv"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(ev) => ev.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 text-white font-semibold text-xs hover:bg-green-600 transition"
                      >
                        📍 오프라인 강의장
                      </a>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </>
  );
}
