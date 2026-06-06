"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BANK, COMPANY } from "@/lib/company";

function formatAmt(n) {
  return Number(n).toLocaleString("ko-KR") + "원";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function OrderStatusPage() {
  const { id: orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`);
      const json = await res.json();
      setData(json);
    } catch {
      // 네트워크 오류 — 기존 상태 유지
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // 입금 대기 중이면 5초마다 폴링
  useEffect(() => {
    if (data?.status !== "pending") return;
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [data?.status, fetchStatus]);

  const status = data?.status;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu py-14 max-w-xl">
          <p className="text-[13px] font-semibold text-ink-soft">주문번호 {orderId}</p>

          {loading ? (
            <div className="mt-10 text-center text-[15px] text-ink-soft">주문 정보를 불러오는 중...</div>
          ) : !data?.ok || !data?.courseTitle ? (
            <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center">
              <p className="text-[18px] font-bold text-ink">주문 정보를 찾을 수 없습니다</p>
              <p className="mt-2 text-[14px] text-ink-soft">주문번호를 다시 확인해 주세요.</p>
              <Link href="/courses" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-[14px] font-bold text-white">
                강의 목록으로
              </Link>
            </div>
          ) : (
            <>
              {/* 상태 배너 */}
              {status === "confirmed" && (
                <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
                  <div className="text-[28px]">✓</div>
                  <p className="mt-2 text-[20px] font-black text-green-700">입금 확인 완료</p>
                  <p className="mt-1 text-[14px] text-green-600">수강 안내를 이메일로 발송했습니다.</p>
                  {data.confirmedAt && (
                    <p className="mt-1 text-[12px] text-green-500">확인 시각: {formatDate(data.confirmedAt)}</p>
                  )}
                </div>
              )}
              {status === "pending" && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <div className="text-[28px] animate-pulse">○</div>
                  <p className="mt-2 text-[20px] font-black text-amber-700">입금 대기 중</p>
                  <p className="mt-1 text-[14px] text-amber-600">아래 계좌로 입금 완료 후 자동으로 확인됩니다.</p>
                  {data.validUntil && (
                    <p className="mt-1 text-[12px] text-amber-500">입금 기한: {formatDate(data.validUntil)}</p>
                  )}
                </div>
              )}
              {status === "expired" && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="mt-2 text-[20px] font-black text-red-700">입금 기한 만료</p>
                  <p className="mt-1 text-[14px] text-red-600">입금 유효기간이 지났습니다. 다시 신청해 주세요.</p>
                </div>
              )}

              {/* 주문 정보 */}
              <div className="mt-6 rounded-2xl border border-line bg-white p-7 space-y-3">
                <h2 className="text-[16px] font-extrabold text-ink">주문 정보</h2>
                <Row label="강의명" value={data.courseTitle} />
                <Row label="결제 금액" value={formatAmt(data.amount)} bold />
                <Row label="입금자명" value={data.depositorName} />
                <Row label="주문번호" value={orderId} mono />
              </div>

              {/* 입금 계좌 (대기 중일 때만) */}
              {status === "pending" && (
                <div className="mt-4 rounded-2xl border border-line bg-white p-7 space-y-3">
                  <h2 className="text-[16px] font-extrabold text-ink">입금 계좌</h2>
                  <Row label="은행" value={BANK.name} />
                  <Row label="계좌번호" value={BANK.account} mono />
                  <Row label="예금주" value={BANK.holder} />
                  <p className="pt-2 text-[13px] text-ink-soft leading-relaxed">
                    입금자명을 <strong className="text-ink">{data.depositorName}</strong>으로 정확히 입력해 주세요.
                    입금 후 1~3분 이내에 자동으로 확인됩니다.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 flex flex-col gap-3">
                {status === "confirmed" && (
                  <Link href="/courses" className="rounded-xl bg-brand px-6 py-3.5 text-center text-[15px] font-bold text-white">
                    다른 강의 둘러보기
                  </Link>
                )}
                {status === "expired" && (
                  <Link href={`/courses`} className="rounded-xl bg-brand px-6 py-3.5 text-center text-[15px] font-bold text-white">
                    다시 신청하기
                  </Link>
                )}
                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "reboundedu"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-line bg-white px-6 py-3.5 text-center text-[14px] font-semibold text-ink-soft hover:bg-cream/50"
                >
                  문의하기 ({COMPANY.phone})
                </a>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-ink-soft shrink-0">{label}</span>
      <span className={`text-right text-ink ${bold ? "font-bold" : ""} ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
