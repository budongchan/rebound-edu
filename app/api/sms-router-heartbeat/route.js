import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

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

export async function POST(req) {
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

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const deviceId = String(body.deviceId || body.device_id || "edu-sms-router").slice(0, 100);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("sms_router_heartbeats")
    .upsert({
      device_id: deviceId,
      service_id: "edu",
      last_seen_at: now,
      app_version: body.appVersion || body.app_version || null,
      battery_pct: body.batteryPct ?? body.battery_pct ?? null,
      metadata: body.metadata || {},
    }, { onConflict: "device_id,service_id" });

  if (error) {
    return NextResponse.json({ ok: false, error: "heartbeat-save-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lastSeenAt: now });
}
