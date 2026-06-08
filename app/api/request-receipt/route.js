import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

function cleanDigits(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function cleanText(value) {
  return String(value || "").trim();
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

  const orderId = cleanText(body?.orderId);
  const receiptType = cleanText(body?.receiptType);
  const businessNumber = cleanDigits(body?.businessNumber);
  const invoiceEmail = cleanText(body?.invoiceEmail);
  const cashReceiptPhone = cleanDigits(body?.cashReceiptPhone);

  if (!orderId || !["tax_invoice", "cash_receipt"].includes(receiptType)) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  if (receiptType === "tax_invoice" && (!businessNumber || !invoiceEmail)) {
    return NextResponse.json({ ok: false, error: "missing-tax-invoice-fields" }, { status: 400 });
  }
  if (receiptType === "cash_receipt" && !cashReceiptPhone) {
    return NextResponse.json({ ok: false, error: "missing-cash-receipt-phone" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 500 });
  }

  const { data: orders } = await supabase
    .from("edu_orders")
    .select("id,order_id,status,course_title,amount,buyer_name,buyer_phone,depositor_name,tax_invoice_requested")
    .eq("order_id", orderId)
    .limit(1);

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ ok: false, error: "order-not-found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  if (receiptType === "tax_invoice") {
    await supabase
      .from("edu_orders")
      .update({
        tax_invoice_requested: true,
        tax_invoice_business_number: businessNumber,
        tax_invoice_email: invoiceEmail,
        tax_invoice_requested_at: now,
      })
      .eq("id", order.id);
  }

  await sendTelegram(
    [
      receiptType === "tax_invoice" ? "[세금계산서발급요청]" : "[현금영수증발급요청]",
      `플랫폼: ${EDU_SERVICE.platform}`,
      `주문번호: ${order.order_id}`,
      `상태: ${order.status}`,
      `결제상품: ${order.course_title || EDU_SERVICE.product}`,
      `금액: ${Number(order.amount || 0).toLocaleString("ko-KR")}원`,
      `주문자: ${order.buyer_name || "-"}`,
      `입금자명: ${order.depositor_name || order.buyer_name || "-"}`,
      receiptType === "tax_invoice" ? `사업자번호: ${businessNumber}` : `현금영수증 휴대폰: ${cashReceiptPhone}`,
      receiptType === "tax_invoice" ? `발급 이메일: ${invoiceEmail}` : `주문자 연락처: ${order.buyer_phone || "-"}`,
    ].join("\n")
  );

  return NextResponse.json({
    ok: true,
    message:
      receiptType === "tax_invoice"
        ? "세금계산서 발급 정보를 접수했습니다. 입금 확인 후 발급됩니다."
        : "현금영수증 발급 정보를 접수했습니다. 입금 확인 후 발급됩니다.",
  });
}
