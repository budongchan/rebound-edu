"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

interface DashboardData {
  totalStudents: number;
  monthlyRevenue: number;
  avgCompletion: number;
  unansweredQna: number;
  courses: { id: string; title: string; status: string; studentCount: number }[];
  schedules: { id: string; type: string; title: string; start_at: string; location: string | null }[];
  questions: { id: string; title: string; userName: string; created_at: string; status: string }[];
}

const SCHEDULE_TYPE_MAP: Record<string, { label: string; color: "blue" | "amber" | "green" | "red" | "gray" }> = {
  filming: { label: "촬영", color: "blue" },
  rehearsal: { label: "리허설", color: "amber" },
  free_lecture: { label: "무료특강", color: "green" },
  main_lecture: { label: "본강의", color: "red" },
  editing_review: { label: "편집검토", color: "gray" },
  other: { label: "기타", color: "gray" },
};

const COURSE_STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "amber" | "gray" | "red" }> = {
  published: { label: "공개중", color: "green" },
  approved: { label: "승인됨", color: "blue" },
  review: { label: "검토중", color: "amber" },
  revision: { label: "수정요청", color: "red" },
  draft: { label: "준비중", color: "gray" },
  archived: { label: "보관", color: "gray" },
};

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const instructorId = profile.id;

      // My courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, status")
        .eq("instructor_id", instructorId)
        .order("created_at", { ascending: false });

      const courseList = courses || [];
      const courseIds = courseList.map((c) => c.id);

      // Enrollment counts per course
      let studentCounts: Record<string, number> = {};
      let totalStudents = 0;
      let avgCompletion = 0;

      if (courseIds.length > 0) {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("course_id, progress_pct")
          .in("course_id", courseIds);

        const enrs = enrollments || [];
        enrs.forEach((e) => {
          studentCounts[e.course_id] = (studentCounts[e.course_id] || 0) + 1;
        });
        totalStudents = enrs.length;
        if (enrs.length > 0) {
          avgCompletion = Math.round(enrs.reduce((s, e) => s + e.progress_pct, 0) / enrs.length);
        }
      }

      // Unanswered Q&A
      let unansweredQna = 0;
      let questions: DashboardData["questions"] = [];
      if (courseIds.length > 0) {
        const { data: qnas } = await supabase
          .from("qna_questions")
          .select("id, title, status, created_at, user:users!qna_questions_user_id_fkey(name)")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false })
          .limit(5);

        const qnaList = (qnas || []).map((q) => {
          const rawUser = q.user as { name: string } | { name: string }[] | null;
          return {
            ...q,
            user: Array.isArray(rawUser) ? rawUser[0] : rawUser,
          };
        });
        unansweredQna = qnaList.filter((q) => q.status === "open").length;
        questions = qnaList.map((q) => ({
          id: q.id,
          title: q.title,
          userName: q.user?.name || "수강생",
          created_at: q.created_at,
          status: q.status,
        }));
      }

      // Schedules (this week)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const { data: schedules } = await supabase
        .from("schedules")
        .select("id, type, title, start_at, location")
        .eq("user_id", instructorId)
        .gte("start_at", weekStart.toISOString())
        .lte("start_at", weekEnd.toISOString())
        .order("start_at");

      // Monthly revenue (simplified: count paid enrollments * course price)
      // In production this would come from payments/settlements
      let monthlyRevenue = 0;
      if (courseIds.length > 0) {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: monthEnrs } = await supabase
          .from("enrollments")
          .select("course_id")
          .in("course_id", courseIds)
          .gte("enrolled_at", monthStart);

        if (monthEnrs && courses) {
          const priceMap: Record<string, number> = {};
          for (const c of courses) {
            const { data: cData } = await supabase
              .from("courses").select("discount_price, price").eq("id", c.id).single();
            if (cData) priceMap[c.id] = cData.discount_price || cData.price;
          }
          monthEnrs.forEach((e) => {
            monthlyRevenue += priceMap[e.course_id] || 0;
          });
        }
      }

      setData({
        totalStudents,
        monthlyRevenue,
        avgCompletion,
        unansweredQna,
        courses: courseList.map((c) => ({
          ...c,
          studentCount: studentCounts[c.id] || 0,
        })),
        schedules: schedules || [],
        questions,
      });
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

  if (!data) return null;

  const formatRevenue = (v: number) => {
    if (v >= 1000000) return `₩${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `₩${(v / 1000).toFixed(0)}K`;
    return `₩${v}`;
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-7">
        <StatCard label="총 수강생" value={data.totalStudents.toLocaleString()} />
        <StatCard label="이번달 매출" value={formatRevenue(data.monthlyRevenue)} />
        <StatCard label="평균 완강률" value={`${data.avgCompletion}%`} />
        <StatCard
          label="미답변 Q&A"
          value={data.unansweredQna.toString()}
          accent={data.unansweredQna > 0 ? "#e03131" : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-bold">이번 주 스케줄</h2>
            <Link href="/teacher/schedule" className="text-xs text-brand hover:underline">
              전체보기
            </Link>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            {data.schedules.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                이번 주 스케줄이 없습니다
              </div>
            ) : (
              data.schedules.map((s) => {
                const st = SCHEDULE_TYPE_MAP[s.type] || SCHEDULE_TYPE_MAP.other;
                const d = new Date(s.start_at);
                const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
                const timeLabel = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                return (
                  <div
                    key={s.id}
                    className="p-3.5 border-b border-gray-50 last:border-0 flex gap-3.5 items-center hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="text-center min-w-[56px]">
                      <Badge color={st.color}>{st.label}</Badge>
                      <p className="text-[11px] text-gray-400 mt-1">{dayLabel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {timeLabel}{s.location ? ` · ${s.location}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">최근 Q&A</h2>
              <Link href="/teacher/qna" className="text-xs text-brand hover:underline">
                전체보기
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.questions.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  질문이 없습니다
                </div>
              ) : (
                data.questions.slice(0, 3).map((q) => (
                  <Link
                    key={q.id}
                    href="/teacher/qna"
                    className="block p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{q.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {q.userName} · {timeAgo(q.created_at)}
                        </p>
                      </div>
                      <Badge color={q.status === "open" ? "red" : "green"}>
                        {q.status === "open" ? "미답변" : "답변완료"}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">내 강의</h2>
              <Link href="/teacher/courses" className="text-xs text-brand hover:underline">
                전체보기
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.courses.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  등록된 강의가 없습니다
                </div>
              ) : (
                data.courses.slice(0, 3).map((c) => {
                  const cs = COURSE_STATUS_MAP[c.status] || COURSE_STATUS_MAP.draft;
                  return (
                    <Link
                      key={c.id}
                      href="/teacher/courses"
                      className="block p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold">{c.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            수강생 {c.studentCount}명
                          </p>
                        </div>
                        <Badge color={cs.color}>{cs.label}</Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
