"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const QUICK_ACTIONS = [
  "강의 추천해주세요",
  "수강 방법이 궁금해요",
  "결제 관련 문의",
];

// ─── 비로그인 사용자용 키워드 기반 응답 ───
const LOCAL_RULES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["수강", "방법", "어떻게", "시작", "신청"],
    answer:
      '수강 방법은 간단합니다!\n\n1️⃣ 회원가입 후 로그인하세요.\n2️⃣ "강의 탐색" 메뉴에서 원하는 강의를 선택하세요.\n3️⃣ 강의 상세 페이지에서 "수강 신청" 버튼을 클릭하세요.\n4️⃣ 결제 완료 후 바로 VOD 시청이 가능합니다.',
  },
  {
    keywords: ["추천", "뭐 들", "어떤 강의", "강의 추천", "배우고"],
    answer:
      "리바운드에듀에서는 다양한 분야의 강의를 제공합니다.\n\n📌 중개업 — 부동산 중개 실무\n📌 숙박업 — 호스텔/숙박 창업\n📌 공실·사업장 — 공실 해결, 사업장 운영\n📌 AI자동화 — AI 기반 업무 자동화\n📌 투자개발 — 부동산 투자 및 개발\n\n회원가입 후 강의 탐색에서 카테고리별로 둘러보세요!",
  },
  {
    keywords: ["결제", "카드", "페이", "가격", "비용", "얼마"],
    answer:
      "결제 관련 안내드립니다.\n\n💳 결제 수단: 신용카드, 카카오페이 등\n🎟️ 쿠폰 코드가 있다면 결제 시 입력하여 할인 적용 가능\n📋 결제 내역은 로그인 후 \"결제 내역\" 메뉴에서 확인 가능합니다.",
  },
  {
    keywords: ["환불", "취소", "철회"],
    answer:
      "환불 관련 안내입니다.\n\n수강 시작 전이라면 전액 환불이 가능하며, 수강 진행 후에는 진도율에 따라 부분 환불이 적용됩니다.\n\n정확한 환불 처리를 위해 고객센터(admin@rebound.io.kr)로 문의해 주세요.",
  },
  {
    keywords: ["수료증", "증명서", "이수"],
    answer:
      "수료증은 해당 강의의 모든 차시를 시청 완료하면 자동으로 발급됩니다.\n\n발급된 수료증은 로그인 후 \"수료증\" 메뉴에서 확인하고 다운로드하실 수 있습니다. 📄",
  },
  {
    keywords: ["문의", "상담", "고객센터", "연락", "전화", "이메일"],
    answer:
      "고객 상담을 원하시나요?\n\n📧 이메일: admin@rebound.io.kr\n📝 로그인 후 Q&A 게시판에서도 질문 가능합니다.\n\n빠르게 답변 드리겠습니다!",
  },
  {
    keywords: ["의뢰", "용역", "프로젝트", "컨설팅"],
    answer:
      "전문가에게 의뢰를 요청하실 수 있습니다.\n\n회원가입 후 \"의뢰 관리\" 메뉴에서 새로운 의뢰를 신청하세요. 컨설팅, 개발, 디자인, 마케팅 등 다양한 서비스를 요청할 수 있습니다.",
  },
  {
    keywords: ["로그인", "비밀번호", "계정", "가입", "회원"],
    answer:
      "계정 관련 안내입니다.\n\n🔐 로그인: Google 계정으로 간편 로그인\n📝 회원가입: Google 로그인 한 번으로 자동 가입\n📱 추가 정보: 첫 로그인 시 이름·연락처만 입력하면 완료\n\n추가 문의는 채널톡으로 연락해 주세요!",
  },
  {
    keywords: ["안녕", "하이", "반가", "ㅎㅇ", "헬로"],
    answer:
      "안녕하세요! 😊 리바운드에듀 AI 상담 도우미입니다.\n\n강의, 수강 방법, 결제 등 궁금한 점이 있으시면 편하게 질문해 주세요!",
  },
];

function getLocalReply(message: string): string {
  const msg = message.toLowerCase();
  for (const rule of LOCAL_RULES) {
    if (rule.keywords.some((kw) => msg.includes(kw))) {
      return rule.answer;
    }
  }
  return "궁금하신 내용에 대해 안내해 드릴게요.\n\n수강 방법, 결제, 환불, 강의 추천 등에 대해 질문해 보세요!\n\n📧 더 자세한 문의: admin@rebound.io.kr";
}

interface ChatBotProps {
  userId?: string;
}

export default function ChatBot({ userId }: ChatBotProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [guestMode] = useState(!userId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect course context from URL
  const courseIdFromUrl =
    pathname.match(/\/student\/explore\/([^/]+)/)?.[1] || null;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Create new conversation on first open (only for logged-in users)
  const initConversation = useCallback(async () => {
    if (guestMode) {
      // 비로그인: 로컬 대화 ID 생성
      setConversationId(`guest-${Date.now()}`);
      return;
    }
    if (conversationId || initializing || !userId) return;
    setInitializing(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "new_conversation",
          courseId: courseIdFromUrl,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    } finally {
      setInitializing(false);
    }
  }, [guestMode, conversationId, initializing, userId, courseIdFromUrl]);

  const handleOpen = () => {
    setOpen(true);
    if (!conversationId) {
      initConversation();
    }
  };

  const handleSend = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading || !conversationId) return;

    // Optimistic UI: add user message immediately
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 비로그인: 로컬 키워드 기반 응답
    if (guestMode) {
      await new Promise((r) => setTimeout(r, 500)); // 자연스러운 딜레이
      const reply = getLocalReply(msgText);
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          role: "assistant",
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    // 로그인: API 호출
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          conversationId,
          message: msgText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: err.error || "오류가 발생했습니다. 다시 시도해주세요.",
            created_at: new Date().toISOString(),
          },
        ]);
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    handleSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Reset conversation when navigating to different course
  useEffect(() => {
    if (conversationId && courseIdFromUrl) {
      setConversationId(null);
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdFromUrl]);

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[88px] right-3 left-3 sm:left-auto sm:right-6 sm:w-[360px] sm:max-w-[calc(100vw-48px)] h-[min(500px,calc(100dvh-120px))] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-brand px-5 py-4 text-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="text-base font-bold">리바운드에듀 AI 상담</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welcome message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gray-50 rounded-2xl rounded-bl-sm px-4 py-3">
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  안녕하세요! 리바운드에듀 AI 상담 도우미입니다. 강의, 수강
                  방법, 결제 등 궁금한 점을 물어보세요.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickAction(q)}
                    disabled={loading || !conversationId}
                    className="border border-brand text-brand rounded-full px-3 py-1.5 text-[12px] font-medium hover:bg-brand-light transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-brand text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  conversationId
                    ? "메시지를 입력하세요..."
                    : "연결 중..."
                }
                className="flex-1 min-w-0 h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-brand"
                disabled={loading || !conversationId}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || !conversationId}
                className="w-10 h-10 min-w-[40px] flex-shrink-0 rounded-lg bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-orange-200 flex items-center justify-center z-50 hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
