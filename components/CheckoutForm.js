"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/courses";
import { COMPANY, BANK } from "@/lib/company";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import CourseGuidanceBox from "@/components/CourseGuidanceBox";

function formatValidUntil(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}까지`;
}

function formatCompactPrice(price) {
  const amount = Number(price || 0);
  if (amount > 0 && amount % 10000 === 0) return `${amount / 10000}만원`;
  return formatPrice(amount);
}

export default function CheckoutForm({ course, selectedScheduleOption = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", depositName: "" });
  const [receipt, setReceipt] = useState({
    type: "cash_receipt",
    cashReceiptPhone: "",
    businessNumber: "",
    invoiceEmail: "",
  });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | bank | done | error
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [copied, setCopied] = useState(false);

  // 입금확인
  const [confirming, setConfirming] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [depositFailed, setDepositFailed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);

  // 계산서 발행
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxForm, setTaxForm] = useState({ businessNumber: "", email: "" });
  const [taxAgree, setTaxAgree] = useState(false);
  const [taxStatus, setTaxStatus] = useState("idle"); // idle | loading | done | error
  const [taxMessage, setTaxMessage] = useState("");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) { setAuthChecked(true); return; }
    const applyUser = (u) => {
      setUser(u);
      setAuthChecked(true);
      if (u) {
        setForm((f) => ({
          ...f,
          name: f.name || u.user_metadata?.full_name || u.user_metadata?.name || "",
          email: f.email || u.email || "",
        }));
      }
    };
    // 초기 세션 1회 조회
    sb.auth.getSession().then(({ data }) => applyUser(data.session?.user ?? null));
    // 세션 복원/로그인/토큰 갱신을 지속 추적 — getSession 단발 호출의 레이스로 로그인이 풀려 보이는 문제 방지
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const isFree = course.free || course.price === 0;
  const courseTitle = selectedScheduleOption
    ? `${course.checkoutTitle || course.title} · ${selectedScheduleOption.label}`
    : course.checkoutTitle || course.title;
  const courseDetailHref = `/courses/${course.parentCourseId || course.id}`;
  const isTaxInvoice = receipt.type === "tax_invoice";
  const receiptValid =
    isFree ||
    (isTaxInvoice
      ? receipt.businessNumber.trim() && /\S+@\S+\.\S+/.test(receipt.invoiceEmail)
      : (receipt.cashReceiptPhone.trim() || form.phone.trim()));
  const valid =
    form.name.trim() &&
    form.phone.trim() &&
    receiptValid &&
    agree;

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function updateReceipt(k, v) { setReceipt((r) => ({ ...r, [k]: v })); }
  function updateTax(k, v) { setTaxForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          scheduleOptionId: selectedScheduleOption?.id,
          buyer: {
            ...form,
            email: form.email || user?.email || "",
          },
          receipt: isFree ? null : {
            ...receipt,
            cashReceiptPhone: receipt.cashReceiptPhone || form.phone,
          },
        }),
      });
      const data = await res.json();
      if (data.status === "free_enrolled") {
        setStatus("done");
        setMessage(data.message || "신청이 완료되었습니다.");
        return;
      }
      if (data.status === "bank_transfer") {
        setOrder(data);
        setGuidance(data.guidance || null);
        setStatus("bank");
        return;
      }
      setStatus("error");
      setMessage(data.message || "요청을 처리할 수 없습니다.");
    } catch {
      setStatus("error");
      setMessage("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  async function handleCheckDeposit() {
    if (!order || confirming) return;
    setConfirming(true);
    setDepositFailed(false);
    setMessage("입금 내역을 확인하고 있습니다. 자동확인이 지연되면 관리자 확인 후 안내드립니다.");
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch("/api/check-deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: order.service,
            orderId: order.order,
            expectedAmount: order.amount,
            depositorName: order.depositName,
          }),
        });
        const data = await res.json();
        if (data.status === "confirmed") {
          setDepositConfirmed(true);
          setConfirmedAt(data.confirmedAt);
          setGuidance(data.guidance || order.guidance || guidance || null);
          setConfirming(false);
          return;
        }
        if (data.status === "expired") {
          setConfirming(false);
          setDepositFailed(true);
          setMessage("입금 유효기한이 지났습니다. 새로 주문해 주세요.");
          return;
        }
      } catch { /* 무시 */ }
      await new Promise((r) => setTimeout(r, 4000));
    }
    setConfirming(false);
    setDepositFailed(true);
    setMessage("아직 자동으로 확인되지 않았습니다. 입금자명과 금액을 확인해 주세요. 확인이 지연되면 관리자가 확인 후 안내드립니다.");
  }

  async function handleTaxInvoice(e) {
    e.preventDefault();
    if (!taxAgree || !taxForm.businessNumber || !taxForm.email) return;
    setTaxStatus("loading");
    try {
      const res = await fetch("/api/request-tax-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.order,
          businessNumber: taxForm.businessNumber,
          email: taxForm.email,
        }),
      });
      const data = await res.json();
      setTaxStatus("done");
      setTaxMessage(data.message || "신청이 완료되었습니다.");
    } catch {
      setTaxStatus("error");
      setTaxMessage("신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }

  function copyAccount() {
    if (!order) return;
    navigator.clipboard?.writeText(order.bank.account.replace(/\s/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  // 로딩 중
  if (!authChecked) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  // 로그인 게이트 — Supabase 설정이 되어 있고 미로그인 상태일 때만
  if (authChecked && !user && getSupabaseBrowser()) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-paper p-8 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white"
          style={{ background: "var(--color-brand)" }}
        >
          🔒
        </div>
        <h2 className="mt-5 text-[20px] font-extrabold text-ink">로그인이 필요합니다</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          {isFree ? "무료 신청을 완료하려면" : "수강 신청을 완료하려면"} 먼저 Google 계정으로 로그인해 주세요.<br />
          계정 정보는 수강 안내에 사용됩니다.
        </p>
        <div className="mt-4 rounded-xl bg-cream/80 p-4 text-left">
          <p className="text-[13px] font-bold text-ink">{courseTitle}</p>
          {(course.scheduleShort || course.schedule) && (
            <p className="text-[12px] text-ink-soft">{selectedScheduleOption?.schedule || course.scheduleShort || course.schedule}</p>
          )}
          <p className="mt-2 text-[16px] font-black text-ink">{formatCompactPrice(course.price)}</p>
        </div>
        <Link
          href={`/login?next=${encodeURIComponent(currentPath)}`}
          className="mt-6 block rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          {isFree ? "Google로 로그인 후 무료 신청하기" : "Google로 로그인 후 신청하기"}
        </Link>
        <Link href={courseDetailHref} className="mt-3 block text-[13px] text-ink-soft hover:text-ink">
          ← 강의 상세로 돌아가기
        </Link>

        {/* TR-04 안심 블록 */}
        <div className="mt-6 rounded-xl border border-line bg-cream/60 p-4 text-left text-[12px] text-ink-soft/80 space-y-0.5">
          <p className="font-semibold text-ink-soft">안심하고 신청하세요</p>
          <p>{COMPANY.legalName} | 대표: {COMPANY.representative} | 사업자등록번호: {COMPANY.bizNo}</p>
          <p>통신판매업신고: {COMPANY.ecommerceNo}</p>
          <p>입금 예금주: {BANK.holder} | 미진행 시 전액 환불</p>
          <p>문의: {COMPANY.phone} / {COMPANY.email}</p>
        </div>
      </div>
    );
  }

  // 무료 신청 완료
  if (status === "done") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white">✓</div>
        <h2 className="mt-5 text-[20px] font-extrabold text-ink">신청이 완료되었습니다</h2>
        <p className="mt-2 text-[14px] text-ink-soft">{message}</p>
        <Link href="/courses" className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-[14px] font-bold text-white">
          다른 강의 보기
        </Link>
      </div>
    );
  }

  // 입금 확인 완료 화면
  if (depositConfirmed && order) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-2xl border border-line bg-paper p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#16a34a] text-2xl text-white">✓</div>
          <h2 className="mt-5 text-[20px] font-extrabold text-ink">입금 완료 처리되었습니다</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            수업 장소와 단톡방 안내를 아래에서 확인해 주세요.<br />
            주문번호 <span className="font-mono font-semibold text-ink">{order.order}</span>을 저장해 두세요.
          </p>
          <div className="mt-5 text-left">
            <CourseGuidanceBox guidance={guidance || order.guidance} compact />
          </div>
          <Link href="/courses" className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-[14px] font-bold text-white">
            다른 강의 보기
          </Link>
        </div>

        {/* 계산서 발행 신청 */}
        <div className="rounded-2xl border border-line bg-paper p-7">
          {!showTaxForm && taxStatus !== "done" ? (
            <>
              <h3 className="text-[16px] font-extrabold text-ink">계산서 발행</h3>
              <p className="mt-1.5 text-[13px] text-ink-soft">사업자의 경우 세금계산서 발행을 신청하실 수 있습니다.</p>
              <button
                onClick={() => setShowTaxForm(true)}
                className="mt-4 rounded-xl border border-line bg-cream px-5 py-2.5 text-[14px] font-semibold text-ink hover:border-ink/30"
              >
                계산서 발행 신청
              </button>
            </>
          ) : taxStatus === "done" ? (
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg text-white">✓</div>
              <p className="mt-3 text-[14px] font-semibold text-ink">{taxMessage}</p>
              <p className="mt-1 text-[13px] text-ink-soft">발행 완료 후 입력하신 이메일로 발송됩니다.</p>
            </div>
          ) : (
            <form onSubmit={handleTaxInvoice}>
              <h3 className="text-[16px] font-extrabold text-ink">계산서 발행 신청</h3>
              <div className="mt-4 space-y-3">
                <Field
                  label="사업자등록번호"
                  value={taxForm.businessNumber}
                  onChange={(v) => updateTax("businessNumber", v)}
                  placeholder="000-00-00000"
                />
                <Field
                  label="이메일"
                  type="email"
                  value={taxForm.email}
                  onChange={(v) => updateTax("email", v)}
                  placeholder="tax@example.com"
                />
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={taxAgree}
                  onChange={(e) => setTaxAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-brand)]"
                />
                <span className="text-[13px] leading-relaxed text-ink-soft">
                  계산서 발행 신청 정보를 확인했습니다.
                </span>
              </label>
              {taxStatus === "error" && (
                <p className="mt-3 rounded-lg bg-brand/5 px-3 py-2 text-[13px] text-brand-dark">{taxMessage}</p>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={!taxAgree || !taxForm.businessNumber || !taxForm.email || taxStatus === "loading"}
                  className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {taxStatus === "loading" ? "신청 중…" : "신청하기"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaxForm(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-[14px] text-ink-soft hover:text-ink"
                >
                  닫기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 유료 — 무통장입금 안내
  if (status === "bank" && order) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-line bg-paper p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-2xl text-white">₩</div>
            <h2 className="mt-5 text-[20px] font-extrabold text-ink">입금 안내</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              주문이 접수되었습니다. 아래 계좌로 입금 후<br />
              [입금 확인하기] 버튼을 눌러주세요.
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-cream p-5">
            <Row label="주문번호" value={order.order} mono />
            <Row label="강의" value={order.courseTitle} />
            <Row label="입금 금액" value={formatPrice(order.amount)} strong />
            <div className="my-3 border-t border-line" />
            <Row label="은행" value={order.bank.name} />
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[13px] text-ink-soft">계좌번호</span>
              <button
                onClick={copyAccount}
                className="flex items-center gap-2 text-[14px] font-bold text-ink hover:text-brand"
              >
                <span className="font-mono">{order.bank.account}</span>
                <span className="rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                  {copied ? "복사됨" : "복사"}
                </span>
              </button>
            </div>
            <Row label="예금주" value={order.bank.holder} />
            <Row label="입금자명" value={order.depositName} strong />
            {order.validUntil && (
              <Row label="입금 유효기한" value={formatValidUntil(order.validUntil)} />
            )}
          </div>

          <p className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3 text-[12px] leading-relaxed text-brand-dark">
            · 입금자명을 <b>{order.depositName}</b>(으)로 입력해 주세요.<br />
            · {order.validUntil ? formatValidUntil(order.validUntil) : "12시간"} 내 미입금 시 주문이 취소될 수 있습니다.<br />
            · 은행 입금 알림이 시스템에 수신되면 아래 버튼으로 입금 확인이 가능합니다.
          </p>

          <p className="mt-3 text-center text-[12px] text-ink-soft">
            나중에 확인하려면{" "}
            <Link href={`/order/${order.order}`} className="font-semibold text-ink underline underline-offset-2">
              주문 상태 페이지
            </Link>
            를 북마크해 두세요.
          </p>

          <button
            onClick={handleCheckDeposit}
            disabled={confirming}
            className="mt-4 w-full rounded-xl bg-brand px-5 py-3.5 text-center text-[15px] font-bold text-white transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? "확인 중…" : "입금 확인하기"}
          </button>
          {depositFailed && message && (
            <p className="mt-3 text-center text-[13px] text-brand-dark">{message}</p>
          )}
          {depositFailed && !message && (
            <p className="mt-3 text-center text-[13px] text-ink-soft">
              아직 입금이 확인되지 않았습니다. 입금 후 1~2분 뒤 다시 시도해 주세요.
            </p>
          )}

          {course.cardPaymentUrl && (
            <div className="mt-5 border-t border-line pt-5 text-center">
              <p className="text-[13px] text-ink-soft">계좌이체 대신 카드로 결제를 원하시면</p>
              <a
                href={course.cardPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 block rounded-xl border-2 px-5 py-3.5 text-center text-[15px] font-bold transition-transform hover:-translate-y-0.5"
                style={{ borderColor: "var(--color-brand)", color: "var(--color-brand)" }}
              >
                카드로 결제하기
              </a>
              <p className="mt-2 text-[12px] text-ink-soft/70">카드결제는 외부 결제창(리바운드 스토어)으로 연결됩니다.</p>
            </div>
          )}

          <Link href="/courses" className="mt-4 block rounded-xl border border-line bg-paper px-6 py-3 text-center text-[14px] font-semibold text-ink-soft hover:text-ink">
            다른 강의 보기
          </Link>
        </div>
      </div>
    );
  }

  // 주문 폼
  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-6">
        <div className="rounded-2xl border border-line bg-paper p-7">
          <h2 className="text-[18px] font-extrabold text-ink">주문자 정보</h2>
          <div className="mt-5 space-y-4">
            <Field label="이름" value={form.name} onChange={(v) => update("name", v)} placeholder="홍길동" />
            <Field label="연락처" value={form.phone} onChange={(v) => update("phone", v)} placeholder="010-0000-0000" />
            {!isFree && (
              <Field
                label="입금자명 (선택)"
                value={form.depositName}
                onChange={(v) => update("depositName", v)}
                placeholder="이름과 다를 경우 입력"
              />
            )}
          </div>
          <p className="mt-3 text-[12px] text-ink-soft/80">
            강의 수강 안내와 입금 확인에 사용됩니다.
          </p>
        </div>

        {!isFree && (
          <ReceiptFields
            receipt={receipt}
            formPhone={form.phone}
            onChange={updateReceipt}
          />
        )}

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

        {status === "error" && (
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-[13px] text-brand-dark">
            {message}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="text-[16px] font-extrabold text-ink">주문 요약</h2>
          <div className="mt-4 border-t border-line pt-4">
            <div className="text-[14px] font-bold text-ink">{courseTitle}</div>
            {course.schedule && (
              <div className="mt-2 rounded-lg bg-cream px-3 py-2 text-[12px] font-semibold text-ink-soft">
                {selectedScheduleOption
                  ? `${selectedScheduleOption.schedule} · ${selectedScheduleOption.place}`
                  : course.place
                    ? `${course.schedule} · ${course.place}`
                    : course.schedule}
              </div>
            )}
          </div>
          <dl className="mt-5 space-y-2 text-[13px]">
            {course.discountPct ? (
              <>
                <div className="flex justify-between"><dt className="text-ink-soft">정가</dt><dd className="text-ink-soft line-through">{formatPrice(course.originalPrice)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">할인</dt><dd className="font-semibold text-brand">-{course.discountPct}%</dd></div>
              </>
            ) : null}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[14px] font-bold text-ink">{isFree ? "수강료" : "입금 금액"}</dt>
              <dd className="text-[22px] font-black text-ink">{formatCompactPrice(course.price)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={!valid || status === "loading"}
            className="mt-5 w-full rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "처리 중…" : isFree ? "무료 신청하기" : "결제하기"}
          </button>
          <p className="mt-3 text-center text-[12px] text-ink-soft/80">
            {isFree ? "로그인 없이 바로 신청됩니다." : "신청 후 입금 계좌가 안내됩니다."}
          </p>

          {/* TR-04 안심 블록 */}
          <div className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-soft/70 space-y-0.5">
            <p className="font-semibold text-ink-soft/80">안심 신청 안내</p>
            <p>{COMPANY.legalName} | 사업자등록번호: {COMPANY.bizNo}</p>
            {!isFree && <p>예금주: {BANK.holder} | 미진행 시 전액 환불</p>}
            <p>문의: {COMPANY.phone}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Row({ label, value, strong, mono }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className={`${strong ? "text-[15px] font-black text-ink" : "text-[14px] font-semibold text-ink"} ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ReceiptFields({ receipt, formPhone, onChange }) {
  const isTaxInvoice = receipt.type === "tax_invoice";

  return (
    <div className="rounded-2xl border border-line bg-paper p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold text-ink">증빙 발급 정보</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            입금 확인 후 선택하신 방식으로 현금영수증 또는 세금계산서를 발급합니다.
          </p>
        </div>
        <span className="mt-2 w-fit rounded-full bg-cream px-3 py-1 text-[11px] font-bold text-ink-soft sm:mt-0">
          계좌이체 전용
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-cream/60 p-1.5">
        {[
          ["cash_receipt", "현금영수증"],
          ["tax_invoice", "세금계산서"],
        ].map(([value, label]) => {
          const selected = receipt.type === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange("type", value)}
              className={`rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors ${
                selected ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:text-ink"
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
              key="receipt-business-number"
              label="사업자등록번호"
              value={receipt.businessNumber}
              onChange={(v) => onChange("businessNumber", v)}
              placeholder="000-00-00000"
            />
            <Field
              key="receipt-invoice-email"
              label="세금계산서 수신 이메일"
              type="email"
              value={receipt.invoiceEmail}
              onChange={(v) => onChange("invoiceEmail", v)}
              placeholder="tax@example.com"
            />
          </>
        ) : (
          <Field
            key="receipt-cash-phone"
            label="현금영수증 발급용 휴대폰번호"
            value={receipt.cashReceiptPhone}
            onChange={(v) => onChange("cashReceiptPhone", v)}
            placeholder={formPhone || "010-0000-0000"}
          />
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-ink-soft/80">
        개인 수강생은 현금영수증, 사업자·법인 수강생은 세금계산서를 선택해 주세요.
      </p>
    </div>
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
