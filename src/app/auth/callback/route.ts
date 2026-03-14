import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // 소셜 로그인 첫 가입 시 users 테이블에 추가
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!existing) {
        await supabase.from("users").insert({
          auth_id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.user_metadata?.full_name || "사용자",
          role: "student",
          is_approved: true,
          is_active: true,
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      }

      return NextResponse.redirect(`${origin}/auth/select-role`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
