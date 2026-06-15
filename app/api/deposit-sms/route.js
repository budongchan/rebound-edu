import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getEduAccountSuffix } from "@/lib/depositAccount";
import { EDU_SERVICE } from "@/lib/depositService";
import { mergeStoredGuidance } from "@/lib/courseGuidance";

function norm(v = "") {
  return String(v).replace(/\s/g, "").trim();
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function parseWooriSms(rawText = "") {
  const accountSuffixToMatch = getEduAccountSuffix();
  const text = String(rawText).replace(/\r/g, "").trim();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bankLine = lines.find((l) => l.startsWith("우리 ")) || "";
  const accountLine = lines.find((l) => /^\*?\d{4,}$/.test(l)) || "";
  const txLine = lines.find((l) => /입금|출금/.test(l) && /원/.test(l)) || "";
  const depositorName = lines[lines.length - 1] || "";
  const dateMatch = bankLine.match(/우리\s+(\d{2}\/\d{2})\s+(\d{2}:\d{2})/);
  const amountMatch = txLine.match(/(입금|출금)\s*([\d,]+)원/);
  const accountSuffix = accountLine.replace(/[^\d]/g, "");
  return {
    raw_text: text,
    bank: bankLine ? "우리은행" : null,
    notified_date: dateMatch?.[1] || null,
    notified_time: dateMatch?.[2] || null,
    account_masked: accountLine || null,
    account_suffix: accountSuffix || null,
    transaction_type: amountMatch?.[1] || null,
    amount: amountMatch?.[2] ? Number(amountMatch[2].replace(/,/g, "")) : null,
    depositor_name: depositorName,
    is_deposit: amountMatch?.[1] === "입금",
    is_expected_account: accountSuffixToMatch ? accountSuffix.endsWith(accountSuffixToMatch) : null,
  };
}

async function getDailyTotal(supabase, amount) {
  try {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const { data } = await supabase
      .from("bank_deposit_notifications")
      .select("amount")
      .eq("is_deposit", true)
      .eq("is_expected_account", true)
      .gte("created_at", from);
    const total = (data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0) + (amount || 0);
    return total.toLocaleString("ko-KR") + "원";
  } catch {
    return "-";
  }
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

async function queueDepositConfirmedSms(supabase, { order, depositEvent, confirmedAt, guidance }) {
  const phone = cleanPhone(order.buyer_phone);
  if (!phone) return;

  const message = [
    "[리바운드에듀]",
    "입금 확인이 완료되어 수강이 확정되었습니다.",
    "",
    `신청 수업명: ${order.course_title || EDU_SERVICE.product}`,
    `수업 일정: ${guidance?.schedule || "신청 확정 후 개별 안내"}`,
    `수업 장소: ${guidance?.locationName || "신청 확정 후 개별 안내"}`,
    "",
    guidance?.address ? `주소: ${guidance.address}` : null,
    guidance?.naverPlaceUrl ? `네이버플레이스: ${guidance.naverPlaceUrl}` : null,
    "",
    "수강생 단톡방:",
    guidance?.groupChatUrl || guidance?.groupChatLabel || "개강 전 카카오톡으로 별도 안내드립니다.",
    "",
    "수업 전 안내사항과 준비물은 단톡방을 통해 공지됩니다.",
    "장소 확인 및 문의가 필요하시면 아래 카톡으로 연락 주세요.",
    "",
    `카톡 문의: ${guidance?.inquiryUrl || "https://pf.kakao.com/_xkxdxgb/chat"}`,
    `주문번호: ${order.order_id}`,
    "",
    "이 번호는 문자 발송 전용으로, 유선 응대가 어렵습니다.",
    "문의는 카카오톡 채널로 남겨 주세요.",
  ].filter(Boolean).join("\n");

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
      source: "deposit-sms-auto-match",
      confirmed_at: confirmedAt,
      buyer_name: order.buyer_name || null,
    },
  }]);
}

async function matchEduOrderForDeposit(supabase, notification) {
  if (!notification?.id || !notification.is_deposit || !notification.amount) {
    return { matched: false, reason: "not-matchable" };
  }

  const eventTime = notification.created_at || new Date().toISOString();
  const { data: candidates, error } = await supabase
    .from(EDU_SERVICE.targetTable)
    .select("*")
    .eq("amount", Number(notification.amount))
    .gte("deposit_valid_until", eventTime)
    .lte("created_at", eventTime)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { matched: false, reason: "order-query-failed", error };

  const order = (candidates || []).find((row) => {
    if (EDU_SERVICE.paidStatuses.includes(row.status)) return false;
    const expectedDepositor = row.depositor_name || row.buyer_name;
    return norm(expectedDepositor) && norm(expectedDepositor) === norm(notification.depositor_name);
  });

  if (!order) return { matched: false, reason: "no-order-match" };

  const now = new Date().toISOString();
  const { data: updatedNotification, error: notificationError } = await supabase
    .from("bank_deposit_notifications")
    .update({
      matched: true,
      confirmed_at: now,
      matched_by: "deposit-sms-auto-match-edu",
      status: "matched",
      metadata: {
        ...(notification.metadata || {}),
        service_id: EDU_SERVICE.id,
        matched_edu_order_id: order.id,
        matched_order_id: order.order_id,
        matched_at: now,
      },
    })
    .eq("id", notification.id)
    .eq("matched", false)
    .select()
    .single();

  if (notificationError || !updatedNotification) {
    return { matched: false, reason: "deposit-event-already-used", error: notificationError };
  }

  const { error: orderUpdateError } = await supabase
    .from(EDU_SERVICE.targetTable)
    .update({ status: EDU_SERVICE.paidStatus, paid_at: now, deposit_confirmed_at: now, payment_method: "bank_transfer" })
    .eq("id", order.id);

  if (orderUpdateError) {
    await supabase
      .from("bank_deposit_notifications")
      .update({
        matched: false,
        confirmed_at: null,
        matched_by: null,
        status: "received",
        metadata: notification.metadata || {},
      })
      .eq("id", notification.id)
      .eq("matched_by", "deposit-sms-auto-match-edu");

    return { matched: false, reason: "order-update-failed", error: orderUpdateError };
  }

  const guidance = mergeStoredGuidance(order);
  await Promise.all([
    sendTelegram(
      [
        "[입금매칭]",
        `플랫폼: ${EDU_SERVICE.platform}`,
        `결제상품: ${order.course_title || EDU_SERVICE.product}`,
        `주문번호: ${order.order_id}`,
        `입금자명: ${notification.depositor_name || "-"}`,
        `금액: ${Number(notification.amount || 0).toLocaleString("ko-KR")}원`,
        `상태: 결제완료 자동 반영`,
        `후속안내: 수강생 확정 문자 큐잉`,
        `입금ID: ${notification.id}`,
      ].join("\n")
    ),
    queueDepositConfirmedSms(supabase, { order, depositEvent: notification, confirmedAt: now, guidance }),
  ]);

  return { matched: true, orderId: order.order_id, confirmedAt: now };
}

export async function POST(req) {
  let rawText = "";
  try {
    const body = await req.json().catch(() => null);
    rawText = body?.rawText || body?.raw_text || body?.text || body?.message || body?.sms || body?.body || "";
  } catch {
    rawText = await req.text().catch(() => "");
  }

  if (!rawText) {
    return NextResponse.json({ ok: false, error: "no-text" }, { status: 400 });
  }

  const parsed = parseWooriSms(rawText);
  const accountSuffixToMatch = getEduAccountSuffix();

  if (!parsed.is_deposit || (accountSuffixToMatch && !parsed.is_expected_account)) {
    return NextResponse.json({ ok: true, status: "ignored", parsed });
  }

  const supabase = getServiceClient();
  let notification = null;
  let dbStatus = "not-configured";

  let matchResult = { matched: false, reason: "not-attempted" };

  if (supabase) {
    const { data, error } = await supabase
      .from("bank_deposit_notifications")
      .insert([{
        ...parsed,
        status: "received",
        matched: false,
        metadata: {
          source: "edu-deposit-sms-webhook",
          service_id: null,
          account_suffix_check: accountSuffixToMatch ? "configured" : "not-configured",
        },
      }])
      .select()
      .single();

    if (!error) {
      notification = data;
      dbStatus = "saved";
      matchResult = await matchEduOrderForDeposit(supabase, notification);
    } else {
      dbStatus = "save-failed";
    }
  }

  const dailyTotal = supabase ? await getDailyTotal(supabase, parsed.amount) : "-";

  await sendTelegram(
    [
      "[입금수신]",
      `플랫폼: 공통 입금수신`,
      `결제상품: 서비스 미확정`,
      `입금자명: ${parsed.depositor_name || "-"}`,
      `금액: ${Number(parsed.amount || 0).toLocaleString("ko-KR")}원`,
      `누적: ${dailyTotal}`,
      `계좌: ${parsed.account_masked || parsed.account_suffix || "-"}`,
      `상태: ${matchResult.matched ? "리바운드에듀 자동매칭 완료" : "공통 수신 · 서비스 미확정"}`,
      matchResult.matched ? `주문번호: ${matchResult.orderId}` : null,
      notification?.id ? `입금ID: ${notification.id}` : null,
    ].filter(Boolean).join("\n")
  );

  return NextResponse.json({ ok: true, status: matchResult.matched ? "matched" : "received", dbStatus, notification, matchResult });
}
