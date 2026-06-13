import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

function getRouterSecret() {
  return (
    process.env.SMS_ROUTER_SHARED_SECRET ||
    process.env.SMS_OUTBOX_TOKEN ||
    process.env.SMS_ROUTER_TOKEN ||
    ""
  );
}

function isAuthorized(req) {
  const secret = getRouterSecret();
  if (!secret) return false;

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerToken = req.headers.get("x-sms-router-token") || "";
  return bearer === secret || headerToken === secret;
}

function parseLimit(value, fallback = DEFAULT_LIMIT) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

function normalizeIds(body) {
  const rawIds = Array.isArray(body.ids) ? body.ids : [body.id].filter(Boolean);
  return rawIds
    .map((id) => String(id).split(":").pop())
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
}

async function claimMessages(req, body = {}) {
  if (!getRouterSecret()) {
    return NextResponse.json({ ok: false, error: "sms-router-secret-not-configured" }, { status: 503 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseLimit(body.limit || searchParams.get("limit"));

  const { data: queued, error: selectError } = await supabase
    .from("sms_outbox")
    .select("id,phone,message,service_id,platform,product,order_id,dedupe_key,created_at")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (selectError) {
    return NextResponse.json({ ok: false, error: "select-failed" }, { status: 500 });
  }

  const ids = (queued || []).map((row) => row.id);
  if (!ids.length) {
    return NextResponse.json({ ok: true, status: "claimed", messages: [], items: [], jobs: [] });
  }

  const now = new Date().toISOString();
  const { data: claimed, error: updateError } = await supabase
    .from("sms_outbox")
    .update({ status: "sending", claimed_at: now, updated_at: now })
    .in("id", ids)
    .eq("status", "queued")
    .select("id,phone,message,service_id,platform,product,order_id,dedupe_key,created_at,claimed_at");

  if (updateError) {
    return NextResponse.json({ ok: false, error: "claim-failed" }, { status: 500 });
  }

  const messages = claimed || [];
  return NextResponse.json({ ok: true, status: "claimed", messages, items: messages, jobs: messages });
}

async function updateMessageStatus(req, body) {
  if (!getRouterSecret()) {
    return NextResponse.json({ ok: false, error: "sms-router-secret-not-configured" }, { status: 503 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }

  const ids = normalizeIds(body);
  if (!ids.length) {
    return NextResponse.json({ ok: false, error: "missing-id" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const status = body.action === "failed" || body.ok === false || body.status === "failed" ? "failed" : "sent";
  const patch = {
    status,
    updated_at: now,
    sent_at: status === "sent" ? now : null,
    error: status === "failed" ? String(body.error || "send-failed").slice(0, 500) : null,
  };

  const { error } = await supabase
    .from("sms_outbox")
    .update(patch)
    .in("id", ids);

  if (error) {
    return NextResponse.json({ ok: false, error: "update-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status, ids, action: body.action || "ack" });
}

export async function GET(req) {
  return claimMessages(req);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (!body.action || body.action === "claim") {
    return claimMessages(req, body);
  }
  if (body.action === "ack" || body.action === "sent" || body.action === "failed") {
    return updateMessageStatus(req, body);
  }

  return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 });
}
