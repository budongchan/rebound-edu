"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/courses";

export default function CheckoutForm({ course }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | pending | done | error
  const [message, setMessage] = useState("");

  const isFree = course.free || course.price === 0;
  const valid =
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim() &&
    agree;

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, buyer: form }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.status === "free_enrolled") {
        setStatus("done");
        setMessage(data.message || "신청이 완료되었습니다.");
        return;
      }
      // Cafe24 실연동 키 미주입 상태 — 플로우 확인용 안내
      setStatus("pending");
      setMessage(data.message || "결제 연동 준비 중입니다.");
    } catch {
      setStatus("error");
      setMessage("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white">✓</div>
        <h2 className="mt-5 text-[20px] font-extrabold text-ink">신청이 완료되었습니다</h2>
        <p className="mt-2 text-[14px] text-ink-soft">{message}</p>
        <Link href="/courses" className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-[14px] font-bold text-white">
          다른 강의 보기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* 주문자 정보 */}
      <div className="min-w-0 space-y-6">
        <div className="rounded-2xl border border-line bg-paper p-7">
          <h2 className="text-[18px] font-extrabold text-ink">주문자 정보</h2>
          <div className="mt-5 space-y-4">
            <Field label="이름" value={form.name} onChange={(v) => update("name", v)} placeholder="홍길동" />
            <Field label="이메일" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="example@email.com" />
            <Field label="연락처" value={form.phone} onChange={(v) => update("phone", v)} placeholder="010-0000-0000" />
          </div>
          <p className="mt-3 text-[12px] text-ink-soft/80">
            강의 수강 안내와 영수증 발송에 사용됩니다.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-7">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
            />
            <span className="text-[13px] leading-relaxed text-ink-soft">
              주문 내용을 확인했으며, <Link href="/terms" className="font-semibold text-ink underline">이용약관</Link> ·{" "}
              <Link href="/privacy" className="font-semibold text-ink underline">개인정보 수집·이용</Link> ·{" "}
              <Link href="/refund" className="font-semibold text-ink underline">환불정책</Link>에 동의합니다. (필수)
            </span>
          </label>
        </div>

        {(status === "pending" || status === "error") && (
          <div className={`rounded-xl border p-4 text-[13px] ${status === "error" ? "border-brand/40 bg-brand/5 text-brand-dark" : "border-line bg-cream text-ink-soft"}`}>
            {message}
          </div>
        )}
      </div>

      {/* 주문 요약 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="text-[16px] font-extrabold text-ink">주문 요약</h2>
          <div className="mt-4 border-t border-line pt-4">
            <div className="text-[14px] font-bold text-ink">{course.title}</div>
            <div className="mt-1 text-[13px] text-ink-soft">{course.subtitle}</div>
          </div>
          <dl className="mt-5 space-y-2 text-[13px]">
            {course.discountPct ? (
              <>
                <div className="flex justify-between"><dt className="text-ink-soft">정가</dt><dd className="text-ink-soft line-through">{formatPrice(course.originalPrice)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">할인</dt><dd className="font-semibold text-brand">-{course.discountPct}%</dd></div>
              </>
            ) : null}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[14px] font-bold text-ink">결제 금액</dt>
              <dd className="text-[22px] font-black text-ink">{formatPrice(course.price)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={!valid || status === "loading"}
            className="mt-5 w-full rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "처리 중…" : isFree ? "무료 신청하기" : "Cafe24 안전결제로 결제"}
          </button>
          <p className="mt-3 text-center text-[12px] text-ink-soft/80">
            {isFree ? "로그인 후 바로 신청됩니다." : "결제 버튼을 누르면 Cafe24 안전결제 창으로 이동합니다."}
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-ink/40 focus:bg-paper"
      />
    </label>
  );
}
