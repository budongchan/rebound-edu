import { NextResponse } from "next/server";
import { getCourse, formatPrice } from "@/lib/courses";

// 결제 시작 엔드포인트.
// P1: 주문 검증 + 무료강의 즉시 신청 처리 + Cafe24 안전결제 연동 자리(置).
//
// Cafe24 실연동을 켜려면 아래 env를 Vercel Production에 주입:
//   CAFE24_MALL_ID, CAFE24_CLIENT_ID, CAFE24_CLIENT_SECRET,
//   CAFE24_PAYMENT_RETURN_URL (예: https://edu.rebound.io.kr/billing/cafe24-success)
// env가 있으면 Cafe24 결제창 URL을 생성해 redirectUrl로 반환하도록 확장한다.

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "잘못된 요청입니다." }, { status: 400 });
  }

  const { courseId, buyer } = body || {};
  const course = getCourse(courseId);

  if (!course) {
    return NextResponse.json({ status: "error", message: "존재하지 않는 강의입니다." }, { status: 404 });
  }
  if (!buyer?.name || !buyer?.email || !buyer?.phone) {
    return NextResponse.json({ status: "error", message: "주문자 정보를 모두 입력해 주세요." }, { status: 400 });
  }

  // 무료 강의 — 즉시 신청 처리 (추후 Supabase enrollments 적재)
  if (course.free || course.price === 0) {
    return NextResponse.json({
      status: "free_enrolled",
      message: `${course.title} 신청이 완료되었습니다. 안내 메일을 확인해 주세요.`,
    });
  }

  const cafe24Ready =
    process.env.CAFE24_MALL_ID &&
    process.env.CAFE24_CLIENT_ID &&
    process.env.CAFE24_CLIENT_SECRET;

  if (cafe24Ready) {
    // TODO: Cafe24 주문 생성 API 호출 → 결제창 URL 수신.
    // const redirectUrl = await createCafe24Order({ course, buyer });
    // return NextResponse.json({ status: "redirect", redirectUrl });
  }

  // 연동 키 미주입 — 플로우 검증용 안내 (운영 전환 전 단계)
  return NextResponse.json({
    status: "pending_integration",
    message:
      `[연동 준비] '${course.title}' ${formatPrice(course.price)} 주문이 정상 접수되었습니다. ` +
      "Cafe24 가맹 키(CAFE24_*)를 주입하면 이 단계에서 실제 결제창으로 이동합니다.",
  });
}
