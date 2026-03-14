"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChannelTalk() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-[88px] right-6 w-[320px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="bg-brand px-5 py-4 text-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-base font-bold">리바운드에듀 상담</span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-white/80">
              안녕하세요! 무엇이든 물어보세요.
            </p>
          </div>
          <div className="p-5">
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
              <p className="text-[13px] text-gray-600">
                안녕하세요! 리바운드에듀입니다. 강의, 결제, 환불 등 궁금하신
                사항을 남겨주세요.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                placeholder="메시지를 입력하세요..."
                className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-brand"
              />
              <button className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-orange-200 flex items-center justify-center z-50 hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
