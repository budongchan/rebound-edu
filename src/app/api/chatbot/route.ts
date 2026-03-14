import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice, formatDuration } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// ─── helpers ────────────────────────────────────────────
interface CourseRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  category: string;
  difficulty: string | null;
  total_lectures: number;
  total_duration_sec: number;
  instructor: { name: string } | { name: string }[] | null;
}

interface LectureRow {
  title: string;
  section_title: string | null;
  duration_sec: number;
  sort_order: number;
}

function instructorName(raw: { name: string } | { name: string }[] | null): string {
  if (!raw) return "강사";
  const inst = Array.isArray(raw) ? raw[0] : raw;
  return inst?.name || "강사";
}

function buildSystemPrompt(
  courses: CourseRow[],
  specificCourse?: CourseRow | null,
  lectures?: LectureRow[],
) {
  let courseContext = "";

  if (specificCourse) {
    courseContext = `
## 현재 사용자가 보고 있는 강의
- 제목: ${specificCourse.title}
- 부제: ${specificCourse.subtitle || "없음"}
- 카테고리: ${CATEGORY_LABELS[specificCourse.category] || specificCourse.category}
- 가격: ${formatPrice(specificCourse.price)}원${specificCourse.discount_price ? ` (할인가: ${formatPrice(specificCourse.discount_price)}원)` : ""}
- 강사: ${instructorName(specificCourse.instructor)}
- 총 강의 수: ${specificCourse.total_lectures}강
- 총 시간: ${formatDuration(specificCourse.total_duration_sec)}
- 난이도: ${specificCourse.difficulty || "미정"}
- 설명: ${(specificCourse.description || "").slice(0, 300)}
${
  lectures && lectures.length > 0
    ? `\n커리큘럼:\n${lectures.map((l, i) => `  ${i + 1}. ${l.section_title ? `[${l.section_title}] ` : ""}${l.title} (${formatDuration(l.duration_sec)})`).join("\n")}`
    : ""
}`;
  }

  const catalogLines = courses
    .slice(0, 30) // 최대 30개 강의
    .map(
      (c) =>
        `- ${c.title} | ${CATEGORY_LABELS[c.category] || c.category} | ${formatPrice(c.price)}원${c.discount_price ? ` → ${formatPrice(c.discount_price)}원` : ""} | ${instructorName(c.instructor)} | ${c.total_lectures}강`,
    )
    .join("\n");

  return `당신은 "리바운드에듀 AI 상담 도우미"입니다. 부동산·공간사업 전문 온라인 교육 플랫폼 리바운드에듀의 상담 챗봇입니다.

## 역할
- 강의 내용, 커리큘럼, 가격, 수강 방법에 대한 문의에 답변합니다.
- 사용자의 관심사에 맞는 강의를 추천합니다.
- 플랫폼 이용 방법을 안내합니다.

## 강의 카테고리
- 중개업: 부동산 중개 관련 교육
- 숙박업: 호스텔/숙박 창업 관련 교육
- 공실·사업장: 공실 해결, 사업장 운영 교육
- AI자동화: AI 기반 업무 자동화 교육
- 투자개발: 부동산 투자 및 개발 교육

## 수강 방법
1. "강의 탐색" 메뉴에서 원하는 강의 선택
2. 강의 상세 페이지에서 "수강 신청" 버튼 클릭
3. 결제 완료 후 "내 강의실"에서 VOD 시청
4. 모든 차시 완료 시 수료증 자동 발급

## 결제 안내
- 결제 수단: 신용카드, 카카오페이 등
- 쿠폰 코드 입력으로 할인 적용 가능
- 결제 내역은 "결제 내역" 메뉴에서 확인

${specificCourse ? courseContext : ""}

## 전체 강의 목록
${catalogLines || "현재 등록된 강의가 없습니다."}

## 주의사항
- 항상 한국어로 답변하세요.
- 친절하고 전문적인 톤을 유지하세요.
- 간결하게 답변하세요 (2~4문장 정도).
- 정확하지 않은 정보는 추측하지 말고, "정확한 답변을 위해 Q&A 게시판에 문의해 주세요"라고 안내하세요.
- 환불, 결제 오류 등 복잡한 문제는 "고객센터를 통해 도움을 드리겠습니다"로 안내하세요.
- 강의 내용에 대한 심층 질문은 해당 강의의 Q&A 게시판 이용을 권유하세요.`;
}

// ─── Route handlers ─────────────────────────────────────
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("auth_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "new_conversation":
        return handleNewConversation(supabase, profile.id, body.courseId);
      case "send_message":
        return handleSendMessage(supabase, profile, body.conversationId, body.message);
      case "get_history":
        return handleGetHistory(supabase, body.conversationId);
      default:
        return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
  } catch (err) {
    console.error("[chatbot] error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// ─── Action handlers ────────────────────────────────────
async function handleNewConversation(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  courseId?: string,
) {
  const { data, error } = await supabase
    .from("chatbot_conversations")
    .insert({
      user_id: userId,
      course_id: courseId || null,
      title: "새 대화",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[chatbot] create conversation error:", error);
    return NextResponse.json({ error: "대화를 생성할 수 없습니다." }, { status: 500 });
  }

  return NextResponse.json({ conversationId: data.id });
}

async function handleGetHistory(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
) {
  if (!conversationId) {
    return NextResponse.json({ messages: [] });
  }

  const { data: messages } = await supabase
    .from("chatbot_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .neq("role", "system")
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages || [] });
}

async function handleSendMessage(
  supabase: ReturnType<typeof createClient>,
  profile: { id: string; name: string; role: string },
  conversationId: string,
  message: string,
) {
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  // Rate limit: 30 messages per hour
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("chatbot_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("role", "user")
    .gte("created_at", oneHourAgo);

  if ((count || 0) >= 30) {
    return NextResponse.json(
      { error: "메시지 제한에 도달했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // 1. Save user message
  await supabase.from("chatbot_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: message.trim(),
  });

  // 2. Load conversation history (last 20 messages)
  const { data: history } = await supabase
    .from("chatbot_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .neq("role", "system")
    .order("created_at", { ascending: true })
    .limit(20);

  // 3. Get conversation context (course_id if any)
  const { data: conversation } = await supabase
    .from("chatbot_conversations")
    .select("course_id")
    .eq("id", conversationId)
    .single();

  // 4. Fetch course data for context
  const { data: allCourses } = await supabase
    .from("courses")
    .select(
      "id, title, subtitle, description, price, discount_price, category, difficulty, total_lectures, total_duration_sec, instructor:users!courses_instructor_id_fkey(name)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  let specificCourse: CourseRow | null = null;
  let lectures: LectureRow[] = [];

  if (conversation?.course_id) {
    specificCourse =
      (allCourses as CourseRow[] | null)?.find((c) => c.id === conversation.course_id) || null;

    if (specificCourse) {
      const { data: lectureData } = await supabase
        .from("lectures")
        .select("title, section_title, duration_sec, sort_order")
        .eq("course_id", conversation.course_id)
        .order("sort_order", { ascending: true });
      lectures = (lectureData as LectureRow[]) || [];
    }
  }

  // 5. Build messages for OpenAI
  const systemPrompt = buildSystemPrompt(
    (allCourses as CourseRow[]) || [],
    specificCourse,
    lectures,
  );

  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // 6. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: openaiMessages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const reply = completion.choices[0]?.message?.content || "죄송합니다. 응답을 생성할 수 없습니다.";

  // 7. Save assistant message
  const { data: savedMsg } = await supabase
    .from("chatbot_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    })
    .select("id, role, content, created_at")
    .single();

  return NextResponse.json({ message: savedMsg });
}
