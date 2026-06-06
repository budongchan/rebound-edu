"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

function getDisplayStatus(status) {
  if (["수강가능", "무료신청완료"].includes(status)) {
    return {
      key: "ready",
      title: "수강가능",
      body: "수강 안내가 발송됩니다. 이메일과 연락처를 확인해 주세요.",
      tone: "bg-[#16a34a]",
    };
  }
  if (["결제완료", "입금확인"].includes(status)) {
    return {
      key: "confirmed",
      title: "입금확인",
      body: "입금이 확인되었습니다. 수강 권한 반영 후 안내를 보내드립니다.",
      tone: "bg-ink",
    };
  }
  return {
    key: "pending",
    title: "입금 대기",
    body: "주문이 정상 접수되었습니다. 아래 계좌로 입금해 주세요.",
    tone: "bg-brand",
  };
}

function Row({ label, value, mono, strong }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="shrink-0 text-[13px] text-ink-soft">{label}</dt>
      <dd className={`${mono ? "font-mono" : ""} ${strong ? "font-black text-ink" : "font-semibold text-ink"} text-right text-[14px]`}>
        {value}
      </dd>
    </div>
  );
}

export default function OrderStatusClient({ initialOrder, bank }) {
  const [order, setOrder] = useState(initialOrder);
  const [copied, setCopied] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const display = useMemo(() => getDisplayStatus(order.status), [order.status]);
  const isPending = display.key === "pending";

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        if (isPending) {
          await fetch("/api/check-deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service: "edu",
              orderId: order.order_id,
              expectedAmount: order.amount,
              depositorName: order.depositor_name || order.buyer_name,
            }),
          });
        }

        const res = await fetch(`/api/order/${order.order_id}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok && data.order) {
          setOrder(data.order);
          setLastCheckedAt(new Date().toISOString());
        }
      } catch {
        if (!cancelled) setLastCheckedAt(new Date().toISOString());
      }
    }

    const timer = setInterval(refresh, 5000);
    refresh();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isPending, order.amount, order.buyer_name, order.depositor_name, order.order_id]);

  function copyAccount() {
    navigator.clipboard?.writeText(bank.account.replace(/\s/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <>
      <div className="min-w-0">
        <div className="rounded-2xl border border-line bg-paper p-7 sm:p-8">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${display.tone} text-[24px] font-black text-white`}>
            {display.key === "pending" ? "₩" : "✓"}
          </div>
          <p className="mt-5 text-[13px] font-bold uppercase tracking-widest text-brand">Order Complete</p>
          <h1 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">{display.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">{display.body}</p>

          <div className="mt-7 rounded-xl border border-line bg-cream/60 p-5">
            <dl>
              <Row label="주문번호" value={order.order_id} mono />
              <Row label="강의" value={order.course_title || "-"} />
              <Row label="입금자명" value={order.depositor_name || order.buyer_name || "-"} />
              <Row label="주문일시" value={formatDateTime(order.created_at)} />
              {order.deposit_valid_until && <Row label="입금기한" value={`${formatDateTime(order.deposit_valid_until)}까지`} />}
              {order.deposit_confirmed_at && <Row label="입금확인" value={formatDateTime(order.deposit_confirmed_at)} />}
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/courses" className="rounded-xl bg-ink px-5 py-3 text-[14px] font-bold text-white">
              다른 강의 보기
            </Link>
            <a
              href="https://pf.kakao.com/_xkxdxgb/chat"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-paper px-5 py-3 text-[14px] font-bold text-ink-soft hover:text-ink"
            >
              카카오톡 문의
            </a>
          </div>
          <p className="mt-4 text-[12px] text-ink-soft/80">
            상태는 5초마다 자동으로 갱신됩니다{lastCheckedAt ? ` · 마지막 확인 ${formatDateTime(lastCheckedAt)}` : ""}.
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="text-[16px] font-extrabold text-ink">입금 계좌</h2>
          <dl className="mt-4 border-t border-line pt-4">
            <Row label="입금 금액" value={formatPrice(order.amount)} strong />
            <Row label="은행" value={bank.name} />
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="shrink-0 text-[13px] text-ink-soft">계좌번호</dt>
              <dd className="text-right">
                <button onClick={copyAccount} className="text-[14px] font-bold text-ink hover:text-brand">
                  <span className="font-mono">{bank.account}</span>
                  <span className="ml-2 rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                    {copied ? "복사됨" : "복사"}
                  </span>
                </button>
              </dd>
            </div>
            <Row label="예금주" value={bank.holder} />
          </dl>
          {isPending && (
            <p className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3 text-[12px] leading-relaxed text-brand-dark">
              입금자명을 {order.depositor_name || order.buyer_name || "주문자명"}으로 입력해 주세요. 입금 후 상태가 자동으로 갱신됩니다.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
