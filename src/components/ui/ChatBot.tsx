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

  // Create new conversation on first open
  const initConversation = useCallback(async () => {
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
  }, [conversationId, initializing, userId, courseIdFromUrl]);

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
        // Show error as assistant message
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
      // New course context detected -> start fresh conversation on next open
      setConversationId(null);
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdFromUrl]);

  if (!userId) return null;

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[88px] right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
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
          <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  conversationId
                    ? "메시지를 입력하세요..."
                    : "연결 중..."
                }
                className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-brand"
                disabled={loading || !conversationId}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || !conversationId}
                className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition disabled:opacity-50"
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
