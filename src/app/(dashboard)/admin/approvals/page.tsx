"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate, formatDuration } from "@/lib/utils";
import { CheckCircle, XCircle, BookOpen, Eye } from "lucide-react";

interface PendingCourse {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  difficulty: string | null;
  price: number;
  discount_price: number | null;
  total_lectures: number;
  total_duration_sec: number;
  status: string;
  created_at: string;
  instructorName: string;
}

const STATUS_MAP: Record<string, { label: string; color: "amber" | "red" | "blue" | "green" | "gray" }> = {
  review: { label: "검토 대기", color: "amber" },
  revision: { label: "수정요청", color: "red" },
  approved: { label: "승인됨", color: "blue" },
  published: { label: "공개중", color: "green" },
  draft: { label: "초안", color: "gray" },
  archived: { label: "보관", color: "gray" },
};

const TABS = [
  { value: "review", label: "검토 대기" },
  { value: "revision", label: "수정요청" },
  { value: "approved", label: "승인됨" },
  { value: "all", label: "전체" },
];

export default function AdminApprovalsPage() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("review");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, subtitle, description, category, difficulty, price, discount_price, total_lectures, total_duration_sec, status, created_at, instructor:users!courses_instructor_id_fkey(name)")
      .in("status", ["review", "revision", "approved"])
      .order("created_at", { ascending: false });

    const parsed = (data || []).map((c) => {
      const rawInst = c.instructor as { name: string } | { name: string }[] | null;
      const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
      return { ...c, instructorName: inst?.name || "강사" };
    });
    setCourses(parsed);
    setLoading(false);
  };

  const handleAction = async (courseId: string, action: "approved" | "revision" | "published") => {
    const supabase = createClient();
    const updateData: Record<string, unknown> = { status: action };
    if (action === "published") updateData.published_at = new Date().toISOString();
    await supabase.from("courses").update(updateData).eq("id", courseId);
    setCourses(courses.map((c) => (c.id === courseId ? { ...c, status: action } : c)));
  };

  const filtered = tab === "all" ? courses : courses.filter((c) => c.status === tab);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">강의 승인</h2>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => {
          const count = t.value === "all" ? courses.length : courses.filter((c) => c.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                tab === t.value
                  ? "bg-brand text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">해당 상태의 강의가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-gray-900">{c.title}</h3>
                        <Badge color={st.color}>{st.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {c.instructorName} · {CATEGORY_LABELS[c.category] || c.category} · {c.total_lectures}강 · {formatDuration(c.total_duration_sec)}
                      </p>
                      {c.subtitle && <p className="text-xs text-gray-400 mt-1">{c.subtitle}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                    >
                      <Eye size={12} /> 상세보기
                    </button>

                    {c.status === "review" && (
                      <>
                        <button
                          onClick={() => handleAction(c.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand rounded-md hover:bg-brand-dark transition"
                        >
                          <CheckCircle size={12} /> 승인
                        </button>
                        <button
                          onClick={() => handleAction(c.id, "revision")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition"
                        >
                          <XCircle size={12} /> 수정요청
                        </button>
                      </>
                    )}

                    {c.status === "approved" && (
                      <button
                        onClick={() => handleAction(c.id, "published")}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition"
                      >
                        공개하기
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && c.description && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.description}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <span>정가: ₩{c.price.toLocaleString()}</span>
                      {c.discount_price && <span>할인가: ₩{c.discount_price.toLocaleString()}</span>}
                      {c.difficulty && <span>난이도: {c.difficulty}</span>}
                    </div>
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
