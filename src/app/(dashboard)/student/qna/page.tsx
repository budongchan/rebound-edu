"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface QnAItem {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  course: { title: string } | null;
  answers: { id: string }[];
}

const STATUS_MAP: Record<string, { label: string; color: "blue" | "green" | "gray" }> = {
  open: { label: "답변 대기", color: "blue" },
  answered: { label: "답변 완료", color: "green" },
  closed: { label: "종료", color: "gray" },
};

export default function StudentQnAPage() {
  const [questions, setQuestions] = useState<QnAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data } = await supabase
        .from("qna_questions")
        .select(`
          id, title, content, status, created_at,
          course:courses(title),
          answers:qna_answers(id)
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      setQuestions(
        (data || []).map((q) => ({
          ...q,
          course: Array.isArray(q.course) ? q.course[0] : q.course,
        }))
      );
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
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">내 질문</h2>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <MessageSquare className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">작성한 질문이 없습니다</p>
          <p className="text-sm text-gray-300">강의 상세 페이지에서 질문할 수 있습니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q) => {
            const st = STATUS_MAP[q.status] || STATUS_MAP.open;
            return (
              <div
                key={q.id}
                className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-300 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1 truncate">
                      {q.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 truncate">{q.content}</p>
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {q.course && <span>{q.course.title}</span>}
                  <span>·</span>
                  <span>{timeAgo(q.created_at)}</span>
                  {q.answers.length > 0 && (
                    <>
                      <span>·</span>
                      <span>답변 {q.answers.length}개</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
