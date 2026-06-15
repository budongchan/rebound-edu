import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";
import { STUDENT_SURVEY_FIELDS, validateStudentSurvey } from "@/lib/studentSurvey";

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

function buildTelegramSummary(order, survey) {
  const fieldwork = survey.fieldworkAvailability?.join(", ") || "-";
  return [
    "[수강생 사전질문]",
    `주문번호: ${order.order_id}`,
    `수업: ${order.course_title || "-"}`,
    `수강생: ${order.buyer_name || "-"}`,
    `연락처: ${order.buyer_phone || "-"}`,
    "",
    `${STUDENT_SURVEY_FIELDS.startupType}: ${survey.startupType || "-"}`,
    `${STUDENT_SURVEY_FIELDS.prepStartedMonth}: ${survey.prepStartedMonth || "-"}`,
    `${STUDENT_SURVEY_FIELDS.targetOpenMonth}: ${survey.targetOpenMonth || "-"}`,
    `${STUDENT_SURVEY_FIELDS.budget}: ${survey.budget || "-"}`,
    `${STUDENT_SURVEY_FIELDS.interestedArea}: ${survey.interestedArea || "-"}`,
    `${STUDENT_SURVEY_FIELDS.residenceArea}: ${survey.residenceArea || "-"}`,
    `${STUDENT_SURVEY_FIELDS.attendanceType}: ${survey.attendanceType || "-"}`,
    `${STUDENT_SURVEY_FIELDS.fieldworkAvailability}: ${fieldwork}`,
    "",
    `${STUDENT_SURVEY_FIELDS.hardestPoint}: ${survey.hardestPoint || "-"}`,
  ].join("\n");
}

async function upsertSurvey(supabase, order, survey) {
  const now = new Date().toISOString();
  const payload = {
    order_id: order.order_id,
    edu_order_id: order.id || null,
    course_id: order.course_id || null,
    course_title: order.course_title || null,
    buyer_name: order.buyer_name || null,
    buyer_phone: order.buyer_phone || null,
    buyer_email: order.buyer_email || null,
    startup_type: survey.startupType,
    prep_started_month: survey.prepStartedMonth,
    target_open_month: survey.targetOpenMonth,
    budget: survey.budget,
    interested_area: survey.interestedArea,
    residence_area: survey.residenceArea,
    hospitality_experience: survey.hospitalityExperience,
    has_support: survey.hasSupport,
    support_detail: survey.supportDetail,
    hardest_point: survey.hardestPoint,
    attendance_type: survey.attendanceType,
    fieldwork_availability: survey.fieldworkAvailability,
    payload: survey,
    submitted_at: now,
    updated_at: now,
  };

  const { error } = await supabase
    .from("edu_student_surveys")
    .upsert([payload], { onConflict: "order_id" });

  return { error };
}

async function updateOrderSurveySnapshot(supabase, orderId, survey) {
  const now = new Date().toISOString();
  await supabase
    .from(EDU_SERVICE.targetTable)
    .update({
      student_survey: survey,
      student_survey_submitted_at: now,
    })
    .eq(EDU_SERVICE.orderIdColumn, orderId);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const orderId = String(body?.orderId || "").trim();
  const { survey, missing } = validateStudentSurvey(body?.survey || {});
  if (!orderId) {
    return NextResponse.json({ ok: false, message: "주문번호가 없습니다." }, { status: 400 });
  }
  if (missing.length) {
    return NextResponse.json({ ok: false, message: "필수 질문을 모두 입력해 주세요.", missing }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: "저장 시스템 연결이 필요합니다." }, { status: 503 });
  }

  const { data: order, error: orderError } = await supabase
    .from(EDU_SERVICE.targetTable)
    .select(EDU_SERVICE.targetSelect)
    .eq(EDU_SERVICE.orderIdColumn, orderId)
    .limit(1)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ ok: false, message: "주문 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ ok: false, message: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await upsertSurvey(supabase, order, survey);
  if (error) {
    console.error("student survey upsert failed", error);
    return NextResponse.json({ ok: false, message: "질문지 저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await Promise.all([
    updateOrderSurveySnapshot(supabase, orderId, survey),
    sendTelegram(buildTelegramSummary(order, survey)),
  ]);

  return NextResponse.json({ ok: true });
}
