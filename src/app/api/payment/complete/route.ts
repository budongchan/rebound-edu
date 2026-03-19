import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPortOnePayment } from "@/lib/portone";

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
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId가 필요합니다." },
        { status: 400 }
      );
    }

    // 3. DB에서 pending 결제 레코드 조회
    const { data: pendingPayment } = await supabase
      .from("payments")
      .select("id, user_id, final_amount, status")
      .eq("pg_payment_key", paymentId)
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

    // 4. PortOne API로 실제 결제 상태 조회
    let portonePayment;
    try {
      portonePayment = await getPortOnePayment(paymentId);
    } catch (apiErr) {
      console.error("[payment/complete] PortOne API error:", apiErr);
      return NextResponse.json(
        { error: "결제 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    // 5. 결제 상태 확인
    if (portonePayment.status !== "PAID") {
      return NextResponse.json(
        {
          error: `결제가 완료되지 않았습니다. (상태: ${portonePayment.status})`,
        },
        { status: 400 }
      );
    }

    // 6. 금액 검증 (위/변조 방지)
    const paidAmount = portonePayment.amount?.total;
    if (paidAmount !== pendingPayment.final_amount) {
      console.error(
        `[payment/complete] 금액 불일치: expected=${pendingPayment.final_amount}, actual=${paidAmount}`
      );
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다. 관리자에게 문의해주세요." },
        { status: 400 }
      );
    }

    // 7. 결제 방법 매핑
    const methodType = portonePayment.method?.type || "";
    const easyPayProvider = portonePayment.method?.easyPay?.provider || "";
    let method = "card";
    if (methodType === "TRANSFER") {
      method = "bank_transfer";
    } else if (methodType === "EASY_PAY" || easyPayProvider) {
      if (easyPayProvider === "KAKAOPAY") method = "kakao";
      else if (easyPayProvider === "NAVERPAY") method = "naver";
      else if (easyPayProvider === "TOSSPAY") method = "toss";
    }

    // 8. payments 테이블 업데이트
    await supabase
      .from("payments")
      .update({
        status: "paid",
        method,
        receipt_url: portonePayment.receiptUrl || null,
        portone_tx_id: portonePayment.pgTxId || null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", pendingPayment.id);

    // 9. enrollments 생성
    const { data: items } = await supabase
      .from("payment_items")
      .select("course_id")
      .eq("payment_id", pendingPayment.id);

    if (items) {
      for (const item of items) {
        // upsert: 이미 수강 중이면 무시
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
