import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ─── helpers ────────────────────────────────────────────
function buildSystemPrompt(coursesText: string) {
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

## 전체 강의 목록
${coursesText || "현재 등록된 강의가 없습니다. 곧 다양한 강의가 업로드될 예정입니다."}

## 주의사항
- 항상 한국어로 답변하세요.
- 친절하고 전문적인 톤을 유지하세요.
- 간결하게 답변하세요 (2~4문장 정도).
- 정확하지 않은 정보는 추측하지 말고, "정확한 답변을 위해 Q&A 게시판에 문의해 주세요"라고 안내하세요.
- 환불, 결제 오류 등 복잡한 문제는 "고객센터를 통해 도움을 드리겠습니다"로 안내하세요.`;
}

// ─── Fallback: 키워드 기반 자동 응답 (API 키 없을 때) ────
interface FallbackRule {
  keywords: string[];
  answer: string;
}

const FALLBACK_RULES: FallbackRule[] = [
  {
    keywords: ["수강", "방법", "어떻게", "시작", "신청"],
    answer:
      '수강 방법은 간단합니다!\n\n1️⃣ "강의 탐색" 메뉴에서 원하는 강의를 선택하세요.\n2️⃣ 강의 상세 페이지에서 "수강 신청" 버튼을 클릭하세요.\n3️⃣ 결제 완료 후 "내 강의실"에서 바로 VOD 시청이 가능합니다.\n4️⃣ 모든 차시를 완료하면 수료증이 자동 발급됩니다.',
  },
  {
    keywords: ["추천", "뭐 들", "어떤 강의", "강의 추천", "배우고"],
    answer:
      "리바운드에듀에서는 다양한 분야의 강의를 제공하고 있습니다.\n\n📌 중개업 — 부동산 중개 실무\n📌 숙박업 — 호스텔/숙박 창업\n📌 공실·사업장 — 공실 해결, 사업장 운영\n📌 AI자동화 — AI 기반 업무 자동화\n📌 투자개발 — 부동산 투자 및 개발\n\n좌측 메뉴의 \"강의 탐색\"에서 카테고리별로 둘러보세요!",
  },
  {
    keywords: ["결제", "카드", "페이", "가격", "비용", "얼마"],
    answer:
      "결제 관련 안내드립니다.\n\n💳 결제 수단: 신용카드, 카카오페이 등\n🎟️ 쿠폰 코드가 있다면 결제 시 입력하여 할인 적용 가능\n📋 결제 내역은 \"결제 내역\" 메뉴에서 확인하실 수 있습니다.\n\n결제 오류가 발생한 경우, 하단 채널톡 버튼으로 고객센터에 문의해 주세요.",
  },
  {
    keywords: ["환불", "취소", "철회"],
    answer:
      "환불 관련 안내입니다.\n\n환불은 수강 시작 전이라면 전액 환불이 가능하며, 수강 진행 후에는 진도율에 따라 부분 환불이 적용됩니다.\n\n정확한 환불 처리를 위해 하단 채널톡 버튼이나 고객센터를 통해 문의해 주세요. 빠르게 도와드리겠습니다! 😊",
  },
  {
    keywords: ["수료증", "증명서", "이수"],
    answer:
      '수료증은 해당 강의의 모든 차시를 시청 완료하면 자동으로 발급됩니다.\n\n발급된 수료증은 좌측 메뉴의 "수료증" 메뉴에서 확인하고 다운로드하실 수 있습니다. 📄',
  },
  {
    keywords: ["문의", "상담", "고객센터", "연락", "전화", "이메일"],
    answer:
      "고객 상담을 원하시나요?\n\n💬 화면 우측 하단의 채널톡 버튼을 클릭하시면 실시간 상담이 가능합니다.\n📧 자세한 문의사항은 Q&A 게시판에 남겨주시면 빠르게 답변 드리겠습니다.",
  },
  {
    keywords: ["의뢰", "용역", "프로젝트", "컨설팅"],
    answer:
      '전문가에게 의뢰를 요청하실 수 있습니다.\n\n좌측 메뉴의 "의뢰 관리"에서 새로운 의뢰를 신청하세요. 수강 중인 강의의 전문가에게 컨설팅, 개발, 디자인, 마케팅 등 다양한 서비스를 요청할 수 있습니다.',
  },
  {
    keywords: ["로그인", "비밀번호", "계정", "가입"],
    answer:
      "계정 관련 안내입니다.\n\n🔐 로그인: 이메일, 카카오, Google 계정으로 로그인 가능\n📝 회원가입: 간단한 정보 입력 후 바로 가입 완료\n🔑 비밀번호 분실: 로그인 페이지의 \"비밀번호 찾기\"를 이용해 주세요.\n\n추가 문의는 채널톡으로 연락해 주세요!",
  },
  {
    keywords: ["안녕", "하이", "반가", "ㅎㅇ", "헬로"],
    answer:
      "안녕하세요! 😊 리바운드에듀 AI 상담 도우미입니다.\n\n강의, 수강 방법, 결제 등 궁금한 점이 있으시면 편하게 질문해 주세요!",
  },
];

function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();
  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some((kw) => msg.includes(kw))) {
      return rule.answer;
    }
  }
  return "궁금하신 내용에 대해 정확한 안내를 위해 아래 방법을 이용해 주세요.\n\n💬 화면 우측 하단 채널톡 버튼 → 실시간 상담\n📝 Q&A 게시판 → 강의 관련 질문\n\n수강 방법, 결제, 환불, 강의 추천 등에 대해서도 물어보실 수 있어요!";
}

// ─── Route handler ──────────────────────────────────────
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
    console.error("[chatbot] top-level error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
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

  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  // Rate limit: 30 messages per hour
  try {
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
  } catch (e) {
    console.error("[chatbot] rate limit check error:", e);
  }

  // 1. Save user message
  const { error: insertErr } = await supabase.from("chatbot_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: message.trim(),
  });

  if (insertErr) {
    console.error("[chatbot] insert user message error:", insertErr);
    return NextResponse.json({ error: "메시지 저장에 실패했습니다." }, { status: 500 });
  }

  // 2. Load conversation history (last 20 messages)
  const { data: history } = await supabase
    .from("chatbot_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .neq("role", "system")
    .order("created_at", { ascending: true })
    .limit(20);

  // 3. Fetch course data for context (with error handling)
  let coursesText = "";
  try {
    const { data: courses } = await supabase
      .from("courses")
      .select("title, price, discount_price, category, total_lectures")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(30);

    if (courses && courses.length > 0) {
      const categoryMap: Record<string, string> = {
        vacancy: "공실·사업장",
        brokerage: "중개업",
        hostel: "숙박업",
        ai_automation: "AI자동화",
        investment: "투자개발",
      };
      coursesText = courses
        .map(
          (c) =>
            `- ${c.title} | ${categoryMap[c.category] || c.category} | ${c.price?.toLocaleString()}원${c.discount_price ? ` → ${c.discount_price.toLocaleString()}원` : ""} | ${c.total_lectures}강`,
        )
        .join("\n");
    }
  } catch (e) {
    console.error("[chatbot] courses query error:", e);
    // Continue without course data
  }

  // 4. Build messages for Claude
  const systemPrompt = buildSystemPrompt(coursesText);

  const claudeMessages: { role: "user" | "assistant"; content: string }[] = (
    history || []
  ).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Ensure messages alternate correctly and start with user
  if (claudeMessages.length === 0 || claudeMessages[0].role !== "user") {
    claudeMessages.unshift({ role: "user", content: message.trim() });
  }

  // 5. Generate reply: Claude API or fallback
  let reply = "";
  if (hasApiKey) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: claudeMessages,
      });

      reply =
        response.content[0]?.type === "text"
          ? response.content[0].text
          : "죄송합니다. 응답을 생성할 수 없습니다.";
    } catch (apiErr) {
      console.error("[chatbot] Claude API error:", apiErr);
      // API 실패 시 폴백 사용
      reply = getFallbackReply(message);
    }
  } else {
    // API 키 없으면 키워드 기반 폴백 응답
    reply = getFallbackReply(message);
  }

  // 6. Save assistant message
  const { data: savedMsg, error: saveErr } = await supabase
    .from("chatbot_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    })
    .select("id, role, content, created_at")
    .single();

  if (saveErr) {
    console.error("[chatbot] save assistant message error:", saveErr);
    // Still return the reply even if saving fails
    return NextResponse.json({
      message: {
        id: `temp-${Date.now()}`,
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({ message: savedMsg });
}
