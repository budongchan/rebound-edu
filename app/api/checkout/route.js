import { NextResponse } from "next/server";
import { getCourse, formatPrice } from "@/lib/courses";
import { BANK } from "@/lib/company";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

function orderNo() {
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

  const order = orderNo();
  const depositorName = buyer.depositName?.trim() || buyer.name.trim();
  const now = new Date();
  const validUntil = new Date(now.getTime() + EDU_SERVICE.validHours * 3600 * 1000).toISOString();

  // Supabase에 주문 저장 (실패해도 진행)
  const supabase = getServiceClient();
  if (supabase) {
    await supabase.from("edu_orders").insert([{
      order_id: order,
      course_id: course.id,
      course_title: course.title,
      amount: course.price,
      buyer_name: buyer.name.trim(),
      buyer_email: buyer.email.trim(),
      buyer_phone: buyer.phone.trim(),
      depositor_name: depositorName,
      status: course.free || course.price === 0 ? "무료신청완료" : "입금대기",
      deposit_valid_until: course.free || course.price === 0 ? null : validUntil,
    }]).catch(() => {});
  }

  // 무료 강의 — 즉시 신청
  if (course.free || course.price === 0) {
    return NextResponse.json({
      status: "free_enrolled",
      message: `${course.title} 신청이 완료되었습니다. 안내 메일을 확인해 주세요.`,
    });
  }

  // 유료 강의 — 무통장입금 안내
  return NextResponse.json({
    status: "bank_transfer",
    order,
    amount: course.price,
    amountText: formatPrice(course.price),
    validUntil,
    bank: {
      name: BANK.name,
      account: BANK.account,
      holder: BANK.holder,
    },
    depositName: depositorName,
    courseTitle: course.title,
    service: EDU_SERVICE.id,
  });
}
