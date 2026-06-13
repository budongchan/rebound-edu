import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getEduAccountSuffix } from "@/lib/depositAccount";

function parseWooriSms(rawText = "") {
  const accountSuffixToMatch = getEduAccountSuffix();
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
    is_expected_account: accountSuffixToMatch ? accountSuffix.endsWith(accountSuffixToMatch) : null,
  };
}

async function getDailyTotal(supabase, amount) {
  try {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const { data } = await supabase
      .from("bank_deposit_notifications")
      .select("amount")
      .eq("is_deposit", true)
      .eq("is_expected_account", true)
      .gte("created_at", from);
    const total = (data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0) + (amount || 0);
    return total.toLocaleString("ko-KR") + "원";
  } catch {
    return "-";
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

export async function POST(req) {
  let rawText = "";
  try {
    const body = await req.json().catch(() => null);
    rawText = body?.rawText || body?.raw_text || body?.text || body?.message || body?.sms || body?.body || "";
  } catch {
    rawText = await req.text().catch(() => "");
  }

  if (!rawText) {
    return NextResponse.json({ ok: false, error: "no-text" }, { status: 400 });
  }

  const parsed = parseWooriSms(rawText);
  const accountSuffixToMatch = getEduAccountSuffix();

  if (!parsed.is_deposit || (accountSuffixToMatch && !parsed.is_expected_account)) {
    return NextResponse.json({ ok: true, status: "ignored", parsed });
  }

  const supabase = getServiceClient();
  let notification = null;
  let dbStatus = "not-configured";

  if (supabase) {
    const { data, error } = await supabase
      .from("bank_deposit_notifications")
      .insert([{
        ...parsed,
        status: "received",
        matched: false,
        metadata: {
          source: "edu-deposit-sms-webhook",
          service_id: null,
          account_suffix_check: accountSuffixToMatch ? "configured" : "not-configured",
        },
      }])
      .select()
      .single();

    if (!error) {
      notification = data;
      dbStatus = "saved";
    } else {
      dbStatus = "save-failed";
    }
  }

  const dailyTotal = supabase ? await getDailyTotal(supabase, parsed.amount) : "-";

  await sendTelegram(
    [
      "[입금수신]",
      `플랫폼: 공통 입금수신`,
      `결제상품: 서비스 미확정`,
      `입금자명: ${parsed.depositor_name || "-"}`,
      `금액: ${Number(parsed.amount || 0).toLocaleString("ko-KR")}원`,
      `누적: ${dailyTotal}`,
      `계좌: ${parsed.account_masked || parsed.account_suffix || "-"}`,
      `상태: 공통 수신 · 서비스 미확정`,
      notification?.id ? `입금ID: ${notification.id}` : null,
    ].filter(Boolean).join("\n")
  );

  return NextResponse.json({ ok: true, status: "received", dbStatus, notification });
}
