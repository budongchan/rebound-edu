import { NextResponse } from "next/server";
import { getCourse, formatPrice } from "@/lib/courses";
import { BANK } from "@/lib/company";

// 결제 시작 엔드포인트 — 무통장입금(계좌이체) 방식.
// P1: 주문 검증 + 무료강의 즉시 신청 + 유료강의 입금 안내(주문번호·계좌·금액) 반환.
// 입금 확인은 운영자 수동 확인 또는 추후 입금 SMS 파싱으로 자동화 (P2: Supabase orders 적재).

function orderNo() {
  // RB + YYMMDD + 4자리 시퀀스(시간 기반) — 입금자 식별용 주문번호
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(d.getTime()).slice(-4);
  return `RB${yy}${mm}${dd}${seq}`;
}

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

  // 유료 강의 — 무통장입금 안내
  const order = orderNo();
  return NextResponse.json({
    status: "bank_transfer",
    order,
    amount: course.price,
    amountText: formatPrice(course.price),
    bank: {
      name: BANK.name,
      account: BANK.account,
      holder: BANK.holder,
      deadlineHours: BANK.deadlineHours,
    },
    depositName: buyer.depositName?.trim() || buyer.name.trim(),
    courseTitle: course.title,
    message:
      `주문이 접수되었습니다. 아래 계좌로 ${formatPrice(course.price)}을(를) 입금해 주세요. ` +
      `입금 확인 후 수강 안내를 보내드립니다.`,
  });
}
