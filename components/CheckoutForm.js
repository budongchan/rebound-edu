"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/lib/courses";
import { COMPANY, BANK } from "@/lib/company";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import ReceiptRequestBox from "@/components/ReceiptRequestBox";

function formatValidUntil(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}까지`;
}

export default function CheckoutForm({ course }) {
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", depositName: "" });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | bank | done | error
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);
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
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setAuthChecked(true);
      if (u) {
        setForm((f) => ({
          ...f,
          name: f.name || u.user_metadata?.full_name || u.user_metadata?.name || "",
          email: f.email || u.email || "",
        }));
      }
    });
  }, []);

  const isFree = course.free || course.price === 0;
  const valid =
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim() &&
    agree;

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function updateTax(k, v) { setTaxForm((f) => ({ ...f, [k]: v })); }

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
      if (data.status === "free_enrolled") {
        setStatus("done");
        setMessage(data.message || "신청이 완료되었습니다.");
        return;
      }
      if (data.status === "bank_transfer") {
        setOrder(data);
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
    for (let i = 0; i < 3; i++) {
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
      if (i < 2) await new Promise((r) => setTimeout(r, 2000));
    }
    setConfirming(false);
    setDepositFailed(true);
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
          <p className="text-[13px] font-bold text-ink">{course.title}</p>
          <p className="text-[12px] text-ink-soft">{course.subtitle}</p>
          <p className="mt-2 text-[16px] font-black text-ink">{formatPrice(course.price)}</p>
        </div>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="mt-6 block rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          {isFree ? "Google로 로그인 후 무료 신청하기" : "Google로 로그인 후 신청하기"}
        </Link>
        <Link href={`/courses/${course.id}`} className="mt-3 block text-[13px] text-ink-soft hover:text-ink">
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
          <h2 className="mt-5 text-[20px] font-extrabold text-ink">입금이 확인되었습니다</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            수강 안내를 입력하신 연락처로 보내드립니다.<br />
            주문번호 <span className="font-mono font-semibold text-ink">{order.order}</span>을 저장해 두세요.
          </p>
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

          <div className="mt-5">
            <ReceiptRequestBox
              orderId={order.order}
              defaultEmail={form.email}
              defaultPhone={form.phone}
            />
          </div>

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
            <Field label="이메일" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="example@email.com" />
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
            {user ? `${user.email} 계정으로 로그인되어 있습니다.` : "강의 수강 안내와 입금 확인에 사용됩니다."}
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
              <dt className="text-[14px] font-bold text-ink">{isFree ? "수강료" : "입금 금액"}</dt>
              <dd className="text-[22px] font-black text-ink">{formatPrice(course.price)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={!valid || status === "loading"}
            className="mt-5 w-full rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "처리 중…" : isFree ? "무료 신청하기" : "계좌이체로 신청하기"}
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
