import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 보호된 경로
  const protectedPaths = ["/student", "/teacher", "/staff", "/admin"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  // 비로그인 → 로그인 페이지로
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // 로그인 상태에서 auth 페이지 접근 → 역할 선택으로 (단, complete-profile/pending은 통과)
  if (
    user &&
    (path === "/auth/login" || path === "/auth/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/select-role";
    return NextResponse.redirect(url);
  }

  // ★ 로그인 상태인데 필수정보 미완성 → /auth/complete-profile 강제
  //   대상 경로: 보호경로(/student·teacher·staff·admin) + /auth/select-role
  //   허용 경로: /auth/complete-profile, /auth/pending, /auth/callback, 공개 페이지
  if (user) {
    const needsProfileCheck =
      isProtected || path === "/auth/select-role";

    if (needsProfileCheck) {
      const { data: profile } = await supabase
        .from("users")
        .select("phone, affiliation_type, affiliation_name")
        .eq("auth_id", user.id)
        .single();

      const isProfileComplete =
        !!profile &&
        !!profile.phone &&
        !!profile.affiliation_type &&
        !!profile.affiliation_name;

      if (!isProfileComplete) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/complete-profile";
        if (isProtected) {
          url.searchParams.set("redirect", path);
        }
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
