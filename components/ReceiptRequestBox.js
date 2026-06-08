"use client";

import { useState } from "react";

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

export default function ReceiptRequestBox({ orderId, defaultEmail = "", defaultPhone = "" }) {
  const [receiptType, setReceiptType] = useState("cash_receipt");
  const [businessNumber, setBusinessNumber] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState(defaultEmail);
  const [cashReceiptPhone, setCashReceiptPhone] = useState(defaultPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const isTaxInvoice = receiptType === "tax_invoice";
  const isValid = isTaxInvoice
    ? businessNumber.trim() && /\S+@\S+\.\S+/.test(invoiceEmail)
    : cashReceiptPhone.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!orderId || !isValid || isSubmitting) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/request-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          receiptType,
          businessNumber,
          invoiceEmail,
          cashReceiptPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "request-failed");
      }
      setResult({ tone: "ok", message: data.message || "증빙 발급 정보를 접수했습니다." });
    } catch {
      setResult({ tone: "error", message: "접수 중 오류가 발생했습니다. 카카오톡 또는 전화로 문의해 주세요." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">증빙 발급 정보</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            입금 확인 후 선택하신 방식으로 현금영수증 또는 세금계산서를 발급합니다.
          </p>
        </div>
        <span className="mt-2 w-fit rounded-full bg-cream px-3 py-1 text-[11px] font-bold text-ink-soft sm:mt-0">
          계좌이체 전용
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream/60 p-1.5">
          {[
            ["cash_receipt", "현금영수증"],
            ["tax_invoice", "세금계산서"],
          ].map(([value, label]) => {
            const isSelected = receiptType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setReceiptType(value)}
                className={`rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors ${
                  isSelected ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          {isTaxInvoice ? (
            <>
              <Field
                label="사업자등록번호"
                value={businessNumber}
                onChange={setBusinessNumber}
                placeholder="000-00-00000"
              />
              <Field
                label="세금계산서 수신 이메일"
                type="email"
                value={invoiceEmail}
                onChange={setInvoiceEmail}
                placeholder="tax@example.com"
              />
            </>
          ) : (
            <Field
              label="현금영수증 발급용 휴대폰번호"
              value={cashReceiptPhone}
              onChange={setCashReceiptPhone}
              placeholder="010-0000-0000"
            />
          )}
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-ink-soft/80">
          세금계산서는 사업자·법인 수강생용, 현금영수증은 개인 수강생용입니다. 입금 확인 후 발급 처리됩니다.
        </p>

        {result && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-[13px] ${
              result.tone === "ok"
                ? "border border-[#16a34a]/20 bg-[#16a34a]/5 text-[#166534]"
                : "border border-brand/20 bg-brand/5 text-brand-dark"
            }`}
          >
            {result.message}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-4 w-full rounded-xl bg-ink px-5 py-3 text-[14px] font-bold text-white transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "접수 중..." : "증빙 발급 정보 저장"}
        </button>
      </form>
    </div>
  );
}
