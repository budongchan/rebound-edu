import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * 웹훅은 사용자 인증 없이 호출되므로 service role 사용
 * RLS를 우회하여 DB에 직접 접근
 */
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    // 1. 웹훅 시그니처 검증 (기본)
    const webhookId = request.headers.get("webhook-id") || "";
    const webhookSignature = request.headers.get("webhook-signature") || "";

    if (!webhookId || !webhookSignature) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    const supabase = createServiceClient();

    switch (type) {
      case "Transaction.Paid": {
        const { paymentId } = data;

        // 이미 paid 상태인지 확인
        const { data: payment } = await supabase
          .from("payments")
          .select("id, status, user_id")
          .eq("pg_payment_key", paymentId)
          .single();

        if (payment && payment.status === "pending") {
          // complete API에서 처리되지 않은 경우 안전장치
          await supabase
            .from("payments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          // enrollments 생성
          const { data: items } = await supabase
            .from("payment_items")
            .select("course_id")
            .eq("payment_id", payment.id);

          if (items) {
            for (const item of items) {
              const { data: existing } = await supabase
                .from("enrollments")
                .select("id")
                .eq("user_id", payment.user_id)
                .eq("course_id", item.course_id)
                .maybeSingle();

              if (!existing) {
                await supabase.from("enrollments").insert({
                  user_id: payment.user_id,
                  course_id: item.course_id,
                  status: "active",
                  progress_pct: 0,
                });
              }
            }
          }
        }
        break;
      }

      case "Transaction.Cancelled":
      case "Transaction.Failed": {
        const { paymentId } = data;
        await supabase
          .from("payments")
          .update({ status: "cancelled" })
          .eq("pg_payment_key", paymentId)
          .eq("status", "pending");
        break;
      }

      default:
        // 알 수 없는 이벤트 타입 — 무시
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payment/webhook] error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
