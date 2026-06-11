import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";
import { COMPANY } from "@/lib/company";

const DEFAULT_ACCOUNT_SUFFIX = "859768";
const ACCOUNT_SUFFIX = process.env.EDU_ACCOUNT_SUFFIX || DEFAULT_ACCOUNT_SUFFIX;

function norm(v = "") {
  return String(v).replace(/\s/g, "").trim();
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

async function queueDepositConfirmedSms(supabase, { order, depositEvent, confirmedAt }) {
  const phone = cleanPhone(order.buyer_phone);
  if (!phone) return;

  const message = [
    "[리바운드에듀]",
    "입금 확인이 완료되었습니다.",
    "─",
    `강의: ${order.course_title || EDU_SERVICE.product}`,
    `주문번호: ${order.order_id}`,
    "─",
    "수강 안내는 개강 전 입력하신 연락처로 보내드립니다.",
    `문의: ${COMPANY.phone}`,
    "감사합니다.",
  ].join("\n");

  await supabase.from("sms_outbox").insert([{
    channel: "sms",
    status: "queued",
    phone,
    message,
    service_id: EDU_SERVICE.id,
    platform: EDU_SERVICE.platform,
    product: order.course_title || EDU_SERVICE.product,
    target_table: EDU_SERVICE.targetTable,
    target_id: order.id ? String(order.id) : null,
    order_id: order.order_id,
    deposit_event_id: depositEvent?.id || null,
    dedupe_key: `edu:deposit-confirmed:${order.id || order.order_id}:${depositEvent?.id || confirmedAt}`,
    metadata: {
      source: "check-deposit",
      confirmed_at: confirmedAt,
      buyer_name: order.buyer_name || null,
    },
  }]).catch(() => {});
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.OFFICE_DEPOSIT_ALERT_CHAT_ID;
  const topicId = process.env.OFFICE_DEPOSIT_ALERT_TOPIC_ID;
  if (!token || !chatId) return;
  const body = { chat_id: chatId, text, disable_web_page_preview: true };
  if (topicId) body.message_thread_id = Number(topicId);
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const { service, orderId, expectedAmount, depositorName } = body || {};
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing-orderId" }, { status: 400 });
  }
  if (service && service !== EDU_SERVICE.id) {
    return NextResponse.json({ ok: false, error: "unknown-service" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, status: "pending", reason: "supabase-not-configured" });
  }

  // 1) 주문 조회
  const { data: orders } = await supabase
    .from("edu_orders")
    .select(EDU_SERVICE.targetSelect)
    .eq("order_id", orderId)
    .limit(1);

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ ok: true, status: "pending", reason: "order-not-found" });
  }

  // 이미 결제완료
  if (EDU_SERVICE.paidStatuses.includes(order.status)) {
    return NextResponse.json({ ok: true, status: "confirmed", confirmedAt: order.deposit_confirmed_at || order.paid_at });
  }

  // deposit_valid_until 만료 체크
  if (order.deposit_valid_until && new Date() > new Date(order.deposit_valid_until)) {
    return NextResponse.json({ ok: true, status: "expired", reason: "deposit-window-expired" });
  }

  const amount = Number(expectedAmount || order.amount);
  const depositor = depositorName || order.depositor_name;

  // 2) 공유 bank_deposit_notifications에서 미매칭 입금 조회
  // 입금 row.created_at은 주문 생성 이후, deposit_valid_until 이전이어야 함
  let depositQuery = supabase
    .from("bank_deposit_notifications")
    .select("id,depositor_name,amount,created_at,is_deposit,is_expected_account,matched,metadata")
    .eq("matched", false)
    .eq("is_deposit", true)
    .eq("amount", amount)
    .gte("created_at", order.created_at)
    .lte("created_at", order.deposit_valid_until || new Date(new Date(order.created_at).getTime() + 12 * 3600000).toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  if (ACCOUNT_SUFFIX) {
    depositQuery = depositQuery.eq("is_expected_account", true);
  }

  const { data: deposits } = await depositQuery;

  const hit = deposits?.find(
    (d) => !d.matched && d.is_deposit && Number(d.amount) === amount && norm(d.depositor_name) === norm(depositor)
  );

  if (!hit) {
    return NextResponse.json({ ok: true, status: "pending", reason: "deposit-not-found" });
  }

  const now = new Date().toISOString();

  // 3) 주문 상태 업데이트
  await supabase
    .from("edu_orders")
    .update({ status: "결제완료", paid_at: now, deposit_confirmed_at: now, payment_method: "bank_transfer" })
    .eq("id", order.id);

  // 4) 입금 이벤트 사용 처리 (matched=false 조건으로 중복 방지, matched_target_id는 FK 충돌로 미사용)
  const { data: updated } = await supabase
    .from("bank_deposit_notifications")
    .update({
      matched: true,
      confirmed_at: now,
      matched_by: "customer-check-deposit-edu",
      status: "matched",
      metadata: {
        ...(hit.metadata || {}),
        service_id: EDU_SERVICE.id,
        matched_edu_order_id: order.id,
        matched_order_id: orderId,
        matched_at: now,
      },
    })
    .eq("id", hit.id)
    .eq("matched", false)
    .select();

  if (!updated?.length) {
    return NextResponse.json({ ok: true, status: "pending", reason: "deposit-event-already-used" });
  }

  // 5) Telegram [입금매칭] 알림 + 고객 2차 알림문자 큐잉 (병렬)
  await Promise.all([
    sendTelegram(
      [
        "[입금매칭]",
        `플랫폼: ${EDU_SERVICE.platform}`,
        `결제상품: ${order.course_title || EDU_SERVICE.product}`,
        `주문번호: ${orderId}`,
        `입금자명: ${hit.depositor_name || "-"}`,
        `금액: ${amount.toLocaleString("ko-KR")}원`,
        `상태: 결제완료 반영`,
        `입금ID: ${hit.id}`,
      ].join("\n")
    ),
    queueDepositConfirmedSms(supabase, { order, depositEvent: hit, confirmedAt: now }),
  ]);

  return NextResponse.json({ ok: true, status: "confirmed", confirmedAt: now });
}
