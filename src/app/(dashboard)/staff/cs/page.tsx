"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import { Headphones, Send, ChevronDown, ChevronUp } from "lucide-react";

interface CsTicket {
  id: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  content: string;
  status: string;
  created_at: string;
  messages: { id: string; senderName: string; content: string; created_at: string }[];
}

const CAT_LABELS: Record<string, string> = {
  refund: "환불 요청",
  payment_error: "결제 오류",
  lecture_inquiry: "강의 문의",
  certificate: "수료증",
  account: "계정",
  other: "기타",
};

const STATUS_MAP: Record<string, { label: string; color: "red" | "amber" | "green" | "gray" }> = {
  pending: { label: "대기", color: "red" },
  in_progress: { label: "진행중", color: "amber" },
  resolved: { label: "완료", color: "green" },
  closed: { label: "종료", color: "gray" },
};

const STATUS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "in_progress", label: "진행중" },
  { value: "resolved", label: "완료" },
];

export default function StaffCsPage() {
  const [tickets, setTickets] = useState<CsTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTickets = async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("users").select("id").eq("auth_id", user.id).single();
      if (profile) setProfileId(profile.id);
    }

    const { data } = await supabase
      .from("cs_tickets")
      .select("id, category, subject, content, status, created_at, user:users!cs_tickets_user_id_fkey(name, email)")
      .order("created_at", { ascending: false });

    const ticketList = (data || []).map((t) => {
      const rawUser = t.user as { name: string; email: string } | { name: string; email: string }[] | null;
      const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
      return {
        id: t.id,
        userName: u?.name || "사용자",
        userEmail: u?.email || "",
        category: t.category,
        subject: t.subject,
        content: t.content,
        status: t.status,
        created_at: t.created_at,
        messages: [] as CsTicket["messages"],
      };
    });

    // Load messages for all tickets
    const ticketIds = ticketList.map((t) => t.id);
    if (ticketIds.length > 0) {
      const { data: msgs } = await supabase
        .from("cs_messages")
        .select("id, ticket_id, content, created_at, sender:users!cs_messages_sender_id_fkey(name)")
        .in("ticket_id", ticketIds)
        .order("created_at");

      msgs?.forEach((m) => {
        const rawSender = m.sender as { name: string } | { name: string }[] | null;
        const sender = Array.isArray(rawSender) ? rawSender[0] : rawSender;
        const ticket = ticketList.find((t) => t.id === m.ticket_id);
        if (ticket) {
          ticket.messages.push({
            id: m.id,
            senderName: sender?.name || "담당자",
            content: m.content,
            created_at: m.created_at,
          });
        }
      });
    }

    setTickets(ticketList);
    setLoading(false);
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim() || !profileId) return;
    setReplying(true);

    const supabase = createClient();
    await supabase.from("cs_messages").insert({
      ticket_id: ticketId,
      sender_id: profileId,
      content: replyText.trim(),
    });

    // Update status to in_progress if pending
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket && ticket.status === "pending") {
      await supabase.from("cs_tickets").update({ status: "in_progress" }).eq("id", ticketId);
    }

    setReplyText("");
    setReplying(false);
    await loadTickets();
  };

  const handleResolve = async (ticketId: string) => {
    const supabase = createClient();
    await supabase.from("cs_tickets").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", ticketId);
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: "resolved" } : t)));
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">CS 상담</h2>

      <div className="flex gap-2 mb-5">
        {STATUS_FILTERS.map((f) => {
          const count = f.value === "all" ? tickets.length : tickets.filter((t) => t.status === f.value).length;
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
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Headphones className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">CS 티켓이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => {
            const st = STATUS_MAP[t.status] || STATUS_MAP.pending;
            const isExpanded = expandedId === t.id;
            return (
              <div key={t.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={() => { setExpandedId(isExpanded ? null : t.id); setReplyText(""); }}
                  className="w-full p-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={st.color}>{st.label}</Badge>
                        <span className="text-xs text-gray-400">{CAT_LABELS[t.category] || t.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{t.subject}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {t.userName} ({t.userEmail}) · {timeAgo(t.created_at)}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    <div className="py-3 border-b border-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.content}</p>
                    </div>

                    {t.messages.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {t.messages.map((m) => (
                          <div key={m.id} className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-blue-700">{m.senderName}</span>
                              <span className="text-[10px] text-blue-400">{timeAgo(m.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{m.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {t.status !== "resolved" && t.status !== "closed" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="답변을 입력하세요..."
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand resize-none"
                          />
                          <button
                            onClick={() => handleReply(t.id)}
                            disabled={replying || !replyText.trim()}
                            className="self-end px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleResolve(t.id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition"
                        >
                          해결 완료
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
