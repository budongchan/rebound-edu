import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      const { data: existing } = await supabase
        .from("users")
        .select("id, phone")
        .eq("auth_id", user.id)
        .single();

      const redirect = searchParams.get("redirect");

      if (!existing) {
        // 첫 소셜 로그인: users 기본 레코드 생성 (phone 비어있음)
        await supabase.from("users").insert({
          auth_id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.user_metadata?.full_name || "",
          role: "student",
          is_approved: true,
          is_active: true,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

        const rp = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
        return NextResponse.redirect(`${origin}/auth/complete-profile${rp}`);
      }

      // 기존 유저: phone 없으면 추가 정보 입력
      if (!existing.phone) {
        const rp = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
        return NextResponse.redirect(`${origin}/auth/complete-profile${rp}`);
      }

      // 프로필 완성 → 정상 진입
      const redirectPath = redirect && redirect.startsWith("/") ? redirect : "/auth/select-role";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
