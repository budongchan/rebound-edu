import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * 토스페이먼츠 웹훅 핸들러
 * 웹훅은 사용자 인증 없이 호출되므로 service role 사용
 */
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    const supabase = createServiceClient();

    switch (eventType) {
      case "PAYMENT_STATUS_CHANGED": {
        const { paymentKey, orderId, status: paymentStatus } = data;

        if (paymentStatus === "DONE") {
          // 결제 완료 — complete API에서 이미 처리된 경우 무시
          const { data: payment } = await supabase
            .from("payments")
            .select("id, status, user_id")
            .eq("pg_order_id", orderId)
            .single();

          if (payment && payment.status === "pending") {
            await supabase
              .from("payments")
              .update({
                status: "paid",
                pg_payment_key: paymentKey,
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
        } else if (paymentStatus === "CANCELED" || paymentStatus === "ABORTED" || paymentStatus === "EXPIRED") {
          await supabase
            .from("payments")
            .update({ status: "cancelled" })
            .eq("pg_order_id", orderId)
            .eq("status", "pending");
        }
        break;
      }

      default:
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
