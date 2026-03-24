import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateOrderId } from "@/lib/tosspayments";

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
      .select("id, name, email, phone")
      .eq("auth_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 요청 파싱
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "강의 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 3. 강의 정보 조회
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price, discount_price, status")
      .eq("id", courseId)
      .single();

    if (!course || course.status !== "published") {
      return NextResponse.json(
        { error: "수강 가능한 강의가 아닙니다." },
        { status: 404 }
      );
    }

    // 4. 중복 수강 확인
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "이미 수강 중인 강의입니다." },
        { status: 409 }
      );
    }

    // 5. 가격 계산
    const basePrice = course.discount_price || course.price;
    const discountAmount = course.discount_price
      ? course.price - course.discount_price
      : 0;
    const finalAmount = basePrice;

    // 6. 무료 강의 처리
    if (finalAmount === 0) {
      const { data: payment } = await supabase
        .from("payments")
        .insert({
          user_id: profile.id,
          total_amount: course.price,
          discount_amount: discountAmount,
          final_amount: 0,
          status: "paid",
          method: null,
          paid_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (payment) {
        await supabase.from("payment_items").insert({
          payment_id: payment.id,
          course_id: courseId,
          price: course.price,
          discount: discountAmount,
        });

        await supabase.from("enrollments").insert({
          user_id: profile.id,
          course_id: courseId,
          status: "active",
          progress_pct: 0,
        });
      }

      return NextResponse.json({
        success: true,
        free: true,
        message: "무료 강의가 등록되었습니다.",
      });
    }

    // 7. 유료 결제: orderId 생성 & pending 레코드 생성
    const orderId = generateOrderId();

    const { data: pendingPayment, error: insertErr } = await supabase
      .from("payments")
      .insert({
        user_id: profile.id,
        pg_order_id: orderId,
        total_amount: course.price,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !pendingPayment) {
      console.error("[payment/prepare] insert error:", insertErr);
      return NextResponse.json(
        { error: "결제 준비에 실패했습니다." },
        { status: 500 }
      );
    }

    // payment_items 생성
    await supabase.from("payment_items").insert({
      payment_id: pendingPayment.id,
      course_id: courseId,
      price: course.price,
      discount: discountAmount,
    });

    return NextResponse.json({
      success: true,
      free: false,
      orderId,
      orderName: course.title,
      totalAmount: finalAmount,
      customerName: profile.name,
      customerEmail: profile.email,
      customerPhone: profile.phone || null,
    });
  } catch (err) {
    console.error("[payment/prepare] error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
