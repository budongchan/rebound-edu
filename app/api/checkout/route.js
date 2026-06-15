import { NextResponse } from "next/server";
import { getCourse, formatPrice } from "@/lib/courses";
import { BANK } from "@/lib/company";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";
import { buildCourseGuidance } from "@/lib/courseGuidance";

function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

async function queueOrderSms(supabase, { order, course, buyer, depositorName, validUntil, guidance }) {
  const phone = cleanPhone(buyer.phone);
  if (!phone) return { queued: false, error: "missing-phone" };
  const courseTitle = course.checkoutTitle || course.title;

  const deadline = new Date(validUntil).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const message = [
    "[리바운드에듀]",
    "수강 신청이 접수되었습니다.",
    "",
    `신청 수업명: ${courseTitle}`,
    `수업 일정: ${guidance?.schedule || course.scheduleShort || course.schedule || "신청 확정 후 개별 안내"}`,
    `수업 장소: ${guidance?.locationName || course.place || "신청 확정 후 개별 안내"}`,
    "",
    `입금 금액: ${formatPrice(course.price)}`,
    `입금 계좌: ${BANK.name} ${BANK.account}`,
    `예금주: ${BANK.holder}`,
    `입금자명: ${depositorName}`,
    `입금 기한: ${deadline}까지`,
    "",
    "입금 완료 확인 후 수강이 확정되며,",
    "수강생 단톡방 및 상세 안내를 문자로 보내드립니다.",
    "",
    `수강생 단톡방: ${guidance?.groupChatUrl || guidance?.groupChatLabel || "입금 완료 후 안내"}`,
    `카톡 문의: ${guidance?.inquiryUrl || course.inquiryUrl || "https://pf.kakao.com/_xkxdxgb/chat"}`,
    `주문번호: ${order}`,
    "",
    "이 번호는 문자 발송 전용으로, 유선 응대가 어렵습니다.",
    "문의는 카카오톡 채널로 남겨 주세요.",
  ].join("\n");

  try {
    const { error } = await supabase.from("sms_outbox").insert([{
      channel: "sms",
      status: "queued",
      phone,
      message,
      service_id: EDU_SERVICE.id,
      platform: EDU_SERVICE.platform,
      product: courseTitle,
      target_table: EDU_SERVICE.targetTable,
      order_id: order,
      dedupe_key: `edu:checkout:${order}`,
      metadata: { source: "checkout", buyer_name: buyer.name.trim() },
    }]);
    if (error) {
      console.error("edu checkout sms queue failed", error);
      return { queued: false, error: error.message || "sms-queue-failed" };
    }
    return { queued: true, error: null };
  } catch (error) {
    return { queued: false, error: error?.message || "sms-queue-crashed" };
  }
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.OFFICE_DEPOSIT_ALERT_CHAT_ID;
  const topicId = process.env.OFFICE_DEPOSIT_ALERT_TOPIC_ID;
  if (!token || !chatId) return;
  const body = { chat_id: chatId, text, disable_web_page_preview: true };
  if (topicId) body.message_thread_id = Number(topicId);
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

async function insertOrderWithGuidance(supabase, orderRow, guidance) {
  const rowWithGuidance = {
    ...orderRow,
    course_schedule: guidance.schedule || null,
    course_place: guidance.locationName || null,
    course_address: guidance.address || null,
    course_naver_place_url: guidance.naverPlaceUrl || null,
    course_group_chat_url: guidance.groupChatUrl || null,
    course_inquiry_url: guidance.inquiryUrl || null,
  };

  const { error } = await supabase.from("edu_orders").insert([rowWithGuidance]);
  if (!error) return { error: null };

  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  const missingGuidanceColumn =
    message.includes("course_") ||
    message.includes("schema cache") ||
    message.includes("column");

  if (!missingGuidanceColumn) return { error };

  console.warn("edu order guidance columns unavailable, retrying base insert", error);
  return supabase.from("edu_orders").insert([orderRow]);
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
  const order = orderNo();
  const depositorName = buyer.depositName?.trim() || buyer.name.trim();
  const now = new Date();
  const validUntil = new Date(now.getTime() + EDU_SERVICE.validHours * 3600 * 1000).toISOString();
  const guidance = buildCourseGuidance(course);

  // 무료 강의 — 즉시 신청
  if (course.free || course.price === 0) {
    return NextResponse.json({
      status: "free_enrolled",
      message: `${course.title} 신청이 완료되었습니다. 수업 안내는 입력하신 연락처로 보내드립니다.`,
    });
  }

  // 유료 강의는 주문 저장이 되어야 입금 알림과 자동 매칭할 수 있다.
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      {
        status: "error",
        code: "order-storage-not-configured",
        message: "주문 저장 시스템 연결이 필요합니다. 카카오톡 채널로 문의해 주세요.",
      },
      { status: 503 }
    );
  }

  try {
    const courseTitle = course.checkoutTitle || course.title;
    const { error } = await insertOrderWithGuidance(supabase, {
      order_id: order,
      course_id: course.id,
      course_title: courseTitle,
      amount: course.price,
      buyer_name: buyer.name.trim(),
      buyer_email: buyer.email.trim(),
      buyer_phone: buyer.phone.trim(),
      depositor_name: depositorName,
      status: "입금대기",
      deposit_valid_until: validUntil,
    }, guidance);

    if (error) {
      console.error("edu order insert failed", error);
      return NextResponse.json(
        {
          status: "error",
          code: "order-storage-failed",
          message: "주문 저장 중 오류가 발생했습니다. 입금 확인을 위해 카카오톡 채널로 문의해 주세요.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("edu order insert crashed", error);
    return NextResponse.json(
      {
        status: "error",
        code: "order-storage-failed",
        message: "주문 저장 중 오류가 발생했습니다. 입금 확인을 위해 카카오톡 채널로 문의해 주세요.",
      },
      { status: 500 }
    );
  }

  const smsResult = await queueOrderSms(supabase, { order, course, buyer, depositorName, validUntil, guidance });
  await sendTelegram(
    [
      "[수강신청]",
      `플랫폼: ${EDU_SERVICE.platform}`,
      `신청수업: ${course.checkoutTitle || course.title}`,
      `주문번호: ${order}`,
      `신청자: ${buyer.name.trim()}`,
      `연락처: ${cleanPhone(buyer.phone) || buyer.phone.trim()}`,
      `입금자명: ${depositorName}`,
      `금액: ${formatPrice(course.price)}`,
      `입금기한: ${new Date(validUntil).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
      `고객문자: ${smsResult.queued ? "큐 등록 완료" : `큐 실패(${smsResult.error || "-"})`}`,
      `상태조회: https://edu.rebound.io.kr/order/${order}`,
    ].join("\n")
  );

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
    courseTitle: course.checkoutTitle || course.title,
    guidance,
    service: EDU_SERVICE.id,
    persisted: true,
    smsQueued: smsResult.queued,
    smsError: smsResult.error,
  });
}
