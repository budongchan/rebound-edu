"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

interface StaffDashboardData {
  totalStudents: number;
  totalTeachers: number;
  pendingCS: number;
  pendingReview: number;
  tickets: { id: string; userName: string; category: string; status: string; created_at: string }[];
  reviewCourses: { id: string; title: string; status: string }[];
}

const CS_CAT_LABELS: Record<string, string> = {
  refund: "환불 요청",
  payment_error: "결제 오류",
  lecture_inquiry: "강의 문의",
  certificate: "수료증",
  account: "계정",
  other: "기타",
};

const CS_STATUS_MAP: Record<string, { label: string; color: "red" | "amber" | "green" | "gray" }> = {
  pending: { label: "대기", color: "red" },
  in_progress: { label: "진행중", color: "amber" },
  resolved: { label: "완료", color: "green" },
  closed: { label: "종료", color: "gray" },
};

export default function StaffDashboard() {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { count: totalStudents } = await supabase
        .from("users").select("*", { count: "exact", head: true }).eq("role", "student");
      const { count: totalTeachers } = await supabase
        .from("users").select("*", { count: "exact", head: true }).eq("role", "teacher");

      // CS tickets
      const { data: tickets } = await supabase
        .from("cs_tickets")
        .select("id, category, status, created_at, user:users!cs_tickets_user_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      const parsedTickets = (tickets || []).map((t) => {
        const rawUser = t.user as { name: string } | { name: string }[] | null;
        const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        return {
          id: t.id,
          userName: u?.name || "사용자",
          category: t.category,
          status: t.status,
          created_at: t.created_at,
        };
      });

      const pendingCS = parsedTickets.filter((t) => t.status === "pending" || t.status === "in_progress").length;

      // Courses pending review
      const { data: reviewCourses } = await supabase
        .from("courses")
        .select("id, title, status")
        .in("status", ["review", "revision"])
        .order("created_at", { ascending: false })
        .limit(5);

      setData({
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        pendingCS,
        pendingReview: (reviewCourses || []).length,
        tickets: parsedTickets,
        reviewCourses: reviewCourses || [],
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

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-7">
        <StatCard label="전체 학생" value={data.totalStudents.toLocaleString()} />
        <StatCard label="등록 교사" value={data.totalTeachers.toString()} />
        <StatCard label="대기 CS" value={data.pendingCS.toString()} accent={data.pendingCS > 0 ? "#e03131" : undefined} />
        <StatCard label="검수 대기" value={data.pendingReview.toString()} accent={data.pendingReview > 0 ? "#e67700" : undefined} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-bold">CS 상담 현황</h2>
            <Link href="/staff/cs" className="text-xs text-brand hover:underline">전체보기</Link>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            {data.tickets.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">CS 티켓이 없습니다</div>
            ) : (
              <>
                <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.6fr] px-4 py-2.5 border-b border-gray-200 text-xs font-semibold text-gray-400">
                  <span>이름</span><span>유형</span><span>접수일</span><span>상태</span>
                </div>
                {data.tickets.map((t) => {
                  const st = CS_STATUS_MAP[t.status] || CS_STATUS_MAP.pending;
                  return (
                    <Link
                      key={t.id}
                      href="/staff/cs"
                      className="grid grid-cols-[1.3fr_1fr_0.7fr_0.6fr] px-4 py-3 border-b border-gray-50 last:border-0 text-sm items-center hover:bg-gray-50"
                    >
                      <span className="font-semibold">{t.userName}</span>
                      <span className="text-gray-600">{CS_CAT_LABELS[t.category] || t.category}</span>
                      <span className="text-gray-400 text-xs">{timeAgo(t.created_at)}</span>
                      <Badge color={st.color}>{st.label}</Badge>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">콘텐츠 검수</h2>
              <Link href="/staff/review" className="text-xs text-brand hover:underline">전체보기</Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.reviewCourses.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">검수 대기 없음</div>
              ) : (
                data.reviewCourses.map((c) => (
                  <div key={c.id} className="p-3 border-b border-gray-50 last:border-0 flex justify-between items-center">
                    <span className="text-sm font-medium">{c.title}</span>
                    <Badge color={c.status === "review" ? "amber" : "red"}>
                      {c.status === "review" ? "검수중" : "수정요청"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
