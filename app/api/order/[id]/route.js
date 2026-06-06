import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing-order-id" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from(EDU_SERVICE.targetTable)
    .select(EDU_SERVICE.targetSelect)
    .eq(EDU_SERVICE.orderIdColumn, id)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "order-query-failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "order-not-found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order: data });
}
