import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const ACCOUNT_SUFFIX = process.env.EDU_ACCOUNT_SUFFIX || "";

function parseWooriSms(rawText = "") {
  const text = String(rawText).replace(/\r/g, "").trim();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bankLine = lines.find((l) => l.startsWith("우리 ")) || "";
  const accountLine = lines.find((l) => /^\*?\d{4,}$/.test(l)) || "";
  const txLine = lines.find((l) => /입금|출금/.test(l) && /원/.test(l)) || "";
  const depositorName = lines[lines.length - 1] || "";
  const dateMatch = bankLine.match(/우리\s+(\d{2}\/\d{2})\s+(\d{2}:\d{2})/);
  const amountMatch = txLine.match(/(입금|출금)\s*([\d,]+)원/);
  const accountSuffix = accountLine.replace(/[^\d]/g, "");
  return {
    raw_text: text,
    bank: bankLine ? "우리은행" : null,
    notified_date: dateMatch?.[1] || null,
    notified_time: dateMatch?.[2] || null,
    account_masked: accountLine || null,
    account_suffix: accountSuffix || null,
    transaction_type: amountMatch?.[1] || null,
    amount: amountMatch?.[2] ? Number(amountMatch[2].replace(/,/g, "")) : null,
    depositor_name: depositorName,
    is_deposit: amountMatch?.[1] === "입금",
    is_expected_account: ACCOUNT_SUFFIX ? accountSuffix.endsWith(ACCOUNT_SUFFIX) : false,
  };
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const topicId = process.env.TELEGRAM_TOPIC_ID;
  if (!token || !chatId) return;
  const body = { chat_id: chatId, text, parse_mode: "HTML" };
  if (topicId) body.message_thread_id = Number(topicId);
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export async function POST(req) {
  let rawText = "";
  try {
    const body = await req.json().catch(() => null);
    rawText =
      body?.rawText || body?.raw_text || body?.text ||
      body?.message || body?.sms || body?.body || "";
  } catch {
    rawText = await req.text().catch(() => "");
  }

  if (!rawText) {
    return NextResponse.json({ ok: false, error: "no-text" }, { status: 400 });
  }

  const parsed = parseWooriSms(rawText);

  if (!parsed.is_deposit || !parsed.is_expected_account) {
    return NextResponse.json({ ok: true, skipped: true, reason: "not-deposit-or-wrong-account" });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    await sendTelegram(
      `[리바운드에듀] 입금 감지 (DB 미설정)\n입금자: <b>${parsed.depositor_name}</b>\n금액: <b>${parsed.amount?.toLocaleString()}원</b>`
    );
    return NextResponse.json({ ok: true, saved: false, reason: "supabase-not-configured" });
  }

  const { data, error } = await supabase
    .from("edu_deposit_notifications")
    .insert([{ ...parsed, status: "unmatched", matched: false, metadata: {} }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await sendTelegram(
    `[리바운드에듀] 입금 확인\n입금자: <b>${parsed.depositor_name}</b>\n금액: <b>${parsed.amount?.toLocaleString()}원</b>\n시각: ${parsed.notified_date} ${parsed.notified_time}`
  );

  return NextResponse.json({ ok: true, saved: true, id: data.id });
}
