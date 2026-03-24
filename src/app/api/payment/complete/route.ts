import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/tosspayments";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 1. 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 요청 파싱
    const { paymentKey, orderId, amount } = await request.json();
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "paymentKey, orderId, amount가 필요합니다." },
        { status: 400 }
      );
    }

    // 3. DB에서 pending 결제 레코드 조회
    const { data: pendingPayment } = await supabase
      .from("payments")
      .select("id, user_id, final_amount, status")
      .eq("pg_order_id", orderId)
      .eq("user_id", profile.id)
      .single();

    if (!pendingPayment) {
      return NextResponse.json(
        { error: "결제 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (pendingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "이미 처리된 결제입니다.",
      });
    }

    // 4. 금액 검증 (위/변조 방지)
    if (amount !== pendingPayment.final_amount) {
      console.error(
        `[payment/complete] 금액 불일치: expected=${pendingPayment.final_amount}, actual=${amount}`
      );
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 5. 토스페이먼츠 결제 승인 API 호출
    let tossPayment;
    try {
      tossPayment = await confirmPayment(paymentKey, orderId, amount);
    } catch (apiErr) {
      console.error("[payment/complete] Toss confirm error:", apiErr);
      return NextResponse.json(
        { error: "결제 승인에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    // 6. 결제 방법 매핑
    let method = "card";
    const tossMethod = tossPayment.method || "";
    if (tossMethod === "계좌이체") method = "bank_transfer";
    else if (tossMethod === "가상계좌") method = "bank_transfer";
    else if (tossPayment.easyPay?.provider === "카카오페이") method = "kakao";
    else if (tossPayment.easyPay?.provider === "네이버페이") method = "naver";
    else if (tossPayment.easyPay?.provider === "토스페이") method = "toss";

    // 7. payments 테이블 업데이트
    await supabase
      .from("payments")
      .update({
        status: "paid",
        method,
        pg_payment_key: paymentKey,
        receipt_url: tossPayment.receipt?.url || null,
        portone_tx_id: tossPayment.transactionKey || null,
        paid_at: tossPayment.approvedAt || new Date().toISOString(),
      })
      .eq("id", pendingPayment.id);

    // 8. enrollments 생성
    const { data: items } = await supabase
      .from("payment_items")
      .select("course_id")
      .eq("payment_id", pendingPayment.id);

    if (items) {
      for (const item of items) {
        const { data: existing } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", profile.id)
          .eq("course_id", item.course_id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("enrollments").insert({
            user_id: profile.id,
            course_id: item.course_id,
            status: "active",
            progress_pct: 0,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "결제가 완료되었습니다.",
    });
  } catch (err) {
    console.error("[payment/complete] error:", err);
    return NextResponse.json(
      { error: "결제 검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
