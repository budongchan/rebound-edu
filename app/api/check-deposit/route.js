import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function norm(v = "") {
  return String(v).replace(/\s/g, "").trim();
}

const CONFIRMED = ["결제완료", "입금확인"];

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const { orderId, expectedAmount, depositorName } = body || {};
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing-orderId" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, status: "pending", reason: "supabase-not-configured" });
  }

  // 1) 주문 조회
  const { data: orders } = await supabase
    .from("edu_orders")
    .select("id,order_id,buyer_name,depositor_name,amount,status,deposit_confirmed_at,paid_at")
    .eq("order_id", orderId)
    .limit(1);

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ ok: true, status: "pending", reason: "order-not-found" });
  }

  // 이미 확인된 주문
  if (CONFIRMED.includes(order.status)) {
    return NextResponse.json({
      ok: true,
      status: "confirmed",
      confirmedAt: order.deposit_confirmed_at || order.paid_at,
    });
  }

  const amount = Number(expectedAmount || order.amount);
  const depositor = depositorName || order.depositor_name;

  // 2) 미매칭 입금 내역 조회
  const { data: deposits } = await supabase
    .from("edu_deposit_notifications")
    .select("*")
    .eq("matched", false)
    .eq("is_deposit", true)
    .eq("is_expected_account", true)
    .eq("amount", amount)
    .order("created_at", { ascending: false })
    .limit(20);

  const hit = deposits?.find(
    (d) =>
      !d.matched &&
      d.is_deposit &&
      d.is_expected_account &&
      Number(d.amount) === amount &&
      norm(d.depositor_name) === norm(depositor)
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

  // 4) 입금 이벤트 사용 처리 (matched=false 조건으로 중복 방지)
  const { data: updated } = await supabase
    .from("edu_deposit_notifications")
    .update({ matched: true, matched_order_id: orderId, confirmed_at: now, matched_by: "customer-check-deposit", status: "matched" })
    .eq("id", hit.id)
    .eq("matched", false)
    .select();

  if (!updated?.length) {
    return NextResponse.json({ ok: true, status: "pending", reason: "deposit-event-already-used" });
  }

  return NextResponse.json({ ok: true, status: "confirmed", confirmedAt: now });
}
