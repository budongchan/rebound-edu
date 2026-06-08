import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing-orderId" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, status: "pending", reason: "supabase-not-configured" });
  }

  const { data: orders } = await supabase
    .from("edu_orders")
    .select("order_id,course_title,amount,status,depositor_name,deposit_valid_until,deposit_confirmed_at,paid_at")
    .eq("order_id", orderId)
    .limit(1);

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ ok: true, status: "pending", reason: "order-not-found" });
  }

  const isPaid = EDU_SERVICE.paidStatuses.includes(order.status);
  const isExpired =
    !isPaid && order.deposit_valid_until && new Date() > new Date(order.deposit_valid_until);

  return NextResponse.json({
    ok: true,
    orderId: order.order_id,
    courseTitle: order.course_title,
    amount: order.amount,
    depositorName: order.depositor_name,
    validUntil: order.deposit_valid_until,
    status: isPaid ? "confirmed" : isExpired ? "expired" : "pending",
    confirmedAt: order.deposit_confirmed_at || order.paid_at || null,
  });
}
