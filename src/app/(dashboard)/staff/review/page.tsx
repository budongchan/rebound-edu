"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate, formatDuration } from "@/lib/utils";
import { ClipboardCheck, CheckCircle, XCircle, Eye } from "lucide-react";

interface ReviewCourse {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  total_lectures: number;
  total_duration_sec: number;
  status: string;
  created_at: string;
  instructorName: string;
}

export default function StaffReviewPage() {
  const [courses, setCourses] = useState<ReviewCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, subtitle, description, category, total_lectures, total_duration_sec, status, created_at, instructor:users!courses_instructor_id_fkey(name)")
      .in("status", ["review", "revision", "approved"])
      .order("created_at", { ascending: false });

    setCourses((data || []).map((c) => {
      const rawInst = c.instructor as { name: string } | { name: string }[] | null;
      const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
      return { ...c, instructorName: inst?.name || "강사" };
    }));
    setLoading(false);
  };

  const handleAction = async (courseId: string, action: "approved" | "revision") => {
    const supabase = createClient();
    await supabase.from("courses").update({ status: action }).eq("id", courseId);
    setCourses(courses.map((c) => (c.id === courseId ? { ...c, status: action } : c)));
  };

  const statusMap: Record<string, { label: string; color: "amber" | "red" | "blue" | "green" }> = {
    review: { label: "검수 대기", color: "amber" },
    revision: { label: "수정요청", color: "red" },
    approved: { label: "승인됨", color: "blue" },
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">콘텐츠 검수</h2>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <ClipboardCheck className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">검수할 콘텐츠가 없습니다</p>
          <p className="text-sm text-gray-300">교사가 강의를 제출하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {courses.map((c) => {
            const st = statusMap[c.status] || statusMap.review;
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={st.color}>{st.label}</Badge>
                        <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {c.instructorName} · {CATEGORY_LABELS[c.category] || c.category} · {c.total_lectures}강 · {formatDuration(c.total_duration_sec)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                    >
                      <Eye size={12} /> 상세
                    </button>
                    {c.status === "review" && (
                      <>
                        <button
                          onClick={() => handleAction(c.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand rounded-md hover:bg-brand-dark transition"
                        >
                          <CheckCircle size={12} /> 검수 통과
                        </button>
                        <button
                          onClick={() => handleAction(c.id, "revision")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition"
                        >
                          <XCircle size={12} /> 수정요청
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {c.subtitle && <p className="text-sm text-gray-500 mb-2">{c.subtitle}</p>}
                    {c.description ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400">설명이 없습니다</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
