"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

interface QnaQuestion {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  courseTitle: string;
  userName: string;
  answers: { id: string; content: string; created_at: string; userName: string }[];
}

const STATUS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "open", label: "미답변" },
  { value: "answered", label: "답변완료" },
  { value: "closed", label: "종료" },
];

export default function TeacherQnaPage() {
  const [questions, setQuestions] = useState<QnaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestions = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("users").select("id").eq("auth_id", user.id).single();
    if (!profile) { setLoading(false); return; }
    setProfileId(profile.id);

    // Get instructor's courses
    const { data: courses } = await supabase
      .from("courses").select("id, title").eq("instructor_id", profile.id);
    if (!courses || courses.length === 0) { setLoading(false); return; }

    const courseIds = courses.map((c) => c.id);
    const courseMap: Record<string, string> = {};
    courses.forEach((c) => { courseMap[c.id] = c.title; });

    // Get questions
    const { data: qnas } = await supabase
      .from("qna_questions")
      .select(`
        id, title, content, status, created_at, course_id,
        user:users!qna_questions_user_id_fkey(name)
      `)
      .in("course_id", courseIds)
      .order("created_at", { ascending: false });

    if (!qnas) { setLoading(false); return; }

    // Get answers
    const qnaIds = qnas.map((q) => q.id);
    const { data: answers } = await supabase
      .from("qna_answers")
      .select("id, question_id, content, created_at, user:users!qna_answers_user_id_fkey(name)")
      .in("question_id", qnaIds)
      .order("created_at");

    const answerMap: Record<string, QnaQuestion["answers"]> = {};
    answers?.forEach((a) => {
      const rawUser = a.user as { name: string } | { name: string }[] | null;
      const userName = Array.isArray(rawUser) ? rawUser[0]?.name : rawUser?.name;
      if (!answerMap[a.question_id]) answerMap[a.question_id] = [];
      answerMap[a.question_id].push({
        id: a.id,
        content: a.content,
        created_at: a.created_at,
        userName: userName || "전문가",
      });
    });

    setQuestions(
      qnas.map((q) => {
        const rawUser = q.user as { name: string } | { name: string }[] | null;
        const userName = Array.isArray(rawUser) ? rawUser[0]?.name : rawUser?.name;
        return {
          id: q.id,
          title: q.title,
          content: q.content,
          status: q.status,
          created_at: q.created_at,
          courseTitle: courseMap[q.course_id] || "",
          userName: userName || "수강생",
          answers: answerMap[q.id] || [],
        };
      })
    );
    setLoading(false);
  };

  const handleReply = async (questionId: string) => {
    if (!replyText.trim() || !profileId) return;
    setReplying(true);

    const supabase = createClient();
    await supabase.from("qna_answers").insert({
      question_id: questionId,
      user_id: profileId,
      content: replyText.trim(),
    });

    // Update question status
    await supabase
      .from("qna_questions")
      .update({ status: "answered" })
      .eq("id", questionId);

    setReplyText("");
    setReplying(false);
    await loadQuestions();
  };

  const filtered = filter === "all" ? questions : questions.filter((q) => q.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">Q&A 관리</h2>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const count = f.value === "all"
            ? questions.length
            : questions.filter((q) => q.status === f.value).length;
          return (
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
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <MessageSquare className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">질문이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                {/* Question header */}
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : q.id);
                    setReplyText("");
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={q.status === "open" ? "red" : q.status === "answered" ? "green" : "gray"}>
                          {q.status === "open" ? "미답변" : q.status === "answered" ? "답변완료" : "종료"}
                        </Badge>
                        <span className="text-xs text-gray-400">{q.courseTitle}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{q.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {q.userName} · {timeAgo(q.created_at)} · 답변 {q.answers.length}개
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    {/* Question content */}
                    <div className="py-3 border-b border-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.content}</p>
                    </div>

                    {/* Answers */}
                    {q.answers.length > 0 && (
                      <div className="space-y-3 mt-3">
                        {q.answers.map((a) => (
                          <div key={a.id} className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-blue-700">{a.userName}</span>
                              <span className="text-[10px] text-blue-400">{timeAgo(a.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {q.status !== "closed" && (
                      <div className="mt-3 flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답변을 입력하세요..."
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition resize-none"
                        />
                        <button
                          onClick={() => handleReply(q.id)}
                          disabled={replying || !replyText.trim()}
                          className="self-end px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                        >
                          <Send size={14} />
                        </button>
                      </div>
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
