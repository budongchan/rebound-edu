import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

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

  const { orderId, businessNumber, email } = body || {};
  if (!orderId || !businessNumber || !email) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 500 });
  }

  // 주문 확인
  const { data: orders } = await supabase
    .from("edu_orders")
    .select("id,order_id,status,course_title,tax_invoice_requested")
    .eq("order_id", orderId)
    .limit(1);

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ ok: false, error: "order-not-found" }, { status: 404 });
  }
  if (!EDU_SERVICE.paidStatuses.includes(order.status)) {
    return NextResponse.json({ ok: false, error: "payment-not-confirmed" }, { status: 400 });
  }
  if (order.tax_invoice_requested) {
    return NextResponse.json({ ok: true, already: true, message: "이미 계산서 발행 신청이 완료되었습니다." });
  }

  const now = new Date().toISOString();
  await supabase.from("edu_orders").update({
    tax_invoice_requested: true,
    tax_invoice_business_number: businessNumber.replace(/\s/g, ""),
    tax_invoice_email: email.trim(),
    tax_invoice_requested_at: now,
  }).eq("id", order.id);

  await sendTelegram(
    [
      "[계산서신청]",
      `플랫폼: ${EDU_SERVICE.platform}`,
      `주문번호: ${orderId}`,
      `결제상품: ${order.course_title || EDU_SERVICE.product}`,
      `사업자번호: ${businessNumber.replace(/\s/g, "")}`,
      `이메일: ${email.trim()}`,
    ].join("\n")
  );

  return NextResponse.json({ ok: true, message: "계산서 발행 신청이 완료되었습니다." });
}
