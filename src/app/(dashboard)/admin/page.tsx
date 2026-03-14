"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ROLE_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";

interface AdminDashboardData {
  monthlyRevenue: number;
  newSignups: number;
  activeCourses: number;
  pendingApprovals: number;
  pendingUsers: { id: string; name: string; role: string; created_at: string }[];
  pendingCourses: { id: string; title: string; instructorName: string; total_lectures: number; created_at: string }[];
  recentPayments: { id: string; amount: number; userName: string; created_at: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Stats
      const { count: activeCourses } = await supabase
        .from("courses").select("*", { count: "exact", head: true }).eq("status", "published");

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: newSignups } = await supabase
        .from("users").select("*", { count: "exact", head: true }).gte("created_at", monthStart);

      // Pending user approvals
      const { data: pendingUsers } = await supabase
        .from("users")
        .select("id, name, role, created_at")
        .eq("is_approved", false)
        .neq("role", "student")
        .order("created_at", { ascending: false })
        .limit(5);

      // Pending course approvals
      const { data: pendingCourses } = await supabase
        .from("courses")
        .select("id, title, total_lectures, created_at, instructor:users!courses_instructor_id_fkey(name)")
        .eq("status", "review")
        .order("created_at", { ascending: false })
        .limit(5);

      const parsedCourses = (pendingCourses || []).map((c) => {
        const rawInst = c.instructor as { name: string } | { name: string }[] | null;
        const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
        return {
          id: c.id,
          title: c.title,
          instructorName: inst?.name || "강사",
          total_lectures: c.total_lectures,
          created_at: c.created_at,
        };
      });

      // Monthly revenue
      const { data: monthPayments } = await supabase
        .from("payments")
        .select("final_amount")
        .eq("status", "paid")
        .gte("paid_at", monthStart);

      const monthlyRevenue = (monthPayments || []).reduce((s, p) => s + p.final_amount, 0);

      // Recent payments
      const { data: recentPays } = await supabase
        .from("payments")
        .select("id, final_amount, created_at, user:users!payments_user_id_fkey(name)")
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(5);

      const recentPayments = (recentPays || []).map((p) => {
        const rawUser = p.user as { name: string } | { name: string }[] | null;
        const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        return {
          id: p.id,
          amount: p.final_amount,
          userName: u?.name || "사용자",
          created_at: p.created_at,
        };
      });

      setData({
        monthlyRevenue,
        newSignups: newSignups || 0,
        activeCourses: activeCourses || 0,
        pendingApprovals: (pendingCourses || []).length,
        pendingUsers: pendingUsers || [],
        pendingCourses: parsedCourses,
        recentPayments,
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleApproveUser = async (userId: string) => {
    const supabase = createClient();
    await supabase.from("users").update({ is_approved: true }).eq("id", userId);
    setData((prev) => prev ? {
      ...prev,
      pendingUsers: prev.pendingUsers.filter((u) => u.id !== userId),
    } : null);
  };

  const handleApproveCourse = async (courseId: string) => {
    const supabase = createClient();
    await supabase.from("courses").update({ status: "approved" }).eq("id", courseId);
    setData((prev) => prev ? {
      ...prev,
      pendingCourses: prev.pendingCourses.filter((c) => c.id !== courseId),
      pendingApprovals: prev.pendingApprovals - 1,
    } : null);
  };

  const handleRejectCourse = async (courseId: string) => {
    const supabase = createClient();
    await supabase.from("courses").update({ status: "revision" }).eq("id", courseId);
    setData((prev) => prev ? {
      ...prev,
      pendingCourses: prev.pendingCourses.filter((c) => c.id !== courseId),
      pendingApprovals: prev.pendingApprovals - 1,
    } : null);
  };

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
        <StatCard label="월 매출" value={formatRevenue(data.monthlyRevenue)} />
        <StatCard label="신규 가입" value={`+${data.newSignups}`} sub="이번달" />
        <StatCard label="승인 대기" value={data.pendingApprovals.toString()} accent={data.pendingApprovals > 0 ? "#e67700" : undefined} />
        <StatCard label="활성 강의" value={data.activeCourses.toString()} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-5">
          {/* Course approvals */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">강의 승인 대기</h2>
              <Link href="/admin/approvals" className="text-xs text-brand hover:underline">전체보기</Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.pendingCourses.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">대기 중인 강의가 없습니다</div>
              ) : (
                data.pendingCourses.map((c) => (
                  <div key={c.id} className="p-4 border-b border-gray-50 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold">{c.title}</span>
                      <Badge color="amber">검토중</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2.5">
                      {c.instructorName} · {c.total_lectures}강 · 제출 {formatDate(c.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveCourse(c.id)}
                        className="flex-1 h-8 rounded-md bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleRejectCourse(c.id)}
                        className="flex-1 h-8 rounded-md border border-gray-200 text-gray-500 text-[13px] font-medium hover:bg-gray-50 transition"
                      >
                        수정요청
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent payments */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">최근 결제</h2>
              <Link href="/admin/revenue" className="text-xs text-brand hover:underline">전체보기</Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.recentPayments.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">결제 내역이 없습니다</div>
              ) : (
                data.recentPayments.map((p) => (
                  <div key={p.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{p.userName}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatDate(p.created_at)}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₩{p.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          {/* User approvals */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold">가입 승인 대기</h2>
              <Link href="/admin/users" className="text-xs text-brand hover:underline">전체보기</Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {data.pendingUsers.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">대기 중인 가입이 없습니다</div>
              ) : (
                data.pendingUsers.map((u) => (
                  <div key={u.id} className="p-3 border-b border-gray-50 last:border-0 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">{u.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role} 신청 · {formatDate(u.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      className="px-3 py-1 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
                    >
                      승인
                    </button>
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
