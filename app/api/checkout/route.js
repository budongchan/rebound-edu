import { NextResponse } from "next/server";
import { getCourse, formatPrice } from "@/lib/courses";
import { BANK, COMPANY, isBankTransferReady } from "@/lib/company";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

async function queueOrderSms(supabase, { order, course, buyer, depositorName, validUntil }) {
  const phone = cleanPhone(buyer.phone);
  if (!phone) return;

  const deadline = new Date(validUntil).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const message = [
    "[리바운드에듀]",
    `${course.title} 수강 신청이 접수되었습니다.`,
    "─",
    `금액: ${formatPrice(course.price)}`,
    `입금자명: ${depositorName}`,
    `입금기한: ${deadline}까지`,
    "─",
    `${BANK.name} ${BANK.account}`,
    `예금주: ${BANK.holder}`,
    `주문번호: ${order}`,
    "─",
    "입금 후 결제 확인 페이지에서 [입금 확인하기] 버튼을 눌러 주세요.",
    `문의: ${COMPANY.phone}`,
  ].join("\n");

  await supabase.from("sms_outbox").insert([{
    channel: "sms",
    status: "queued",
    phone,
    message,
    service_id: EDU_SERVICE.id,
    platform: EDU_SERVICE.platform,
    product: course.title,
    target_table: EDU_SERVICE.targetTable,
    order_id: order,
    dedupe_key: `edu:checkout:${order}`,
    metadata: { source: "checkout", buyer_name: buyer.name.trim() },
  }]).catch(() => {});
}

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
  if (!course.free && course.price > 0 && !isBankTransferReady()) {
    return NextResponse.json(
      {
        status: "error",
        message: "결제 준비 중입니다. 카카오톡으로 문의해 주세요.",
        contactUrl: "https://pf.kakao.com/_xkxdxgb/chat",
      },
      { status: 503 }
    );
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

    // 1차 알림 문자 — 수강 신청 접수 + 계좌 안내 (유료 강의만)
    if (!course.free && course.price > 0) {
      await queueOrderSms(supabase, { order, course, buyer, depositorName, validUntil });
    }
  }

  // 무료 강의 — 즉시 신청
  if (course.free || course.price === 0) {
    return NextResponse.json({
      status: "free_enrolled",
      message: `${course.title} 신청이 완료되었습니다. 수업 안내는 입력하신 연락처로 보내드립니다.`,
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
