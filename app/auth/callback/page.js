"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sb = getSupabaseBrowser();
    const next = searchParams.get("next") || "/";
    const code = searchParams.get("code");

    if (!sb) {
      router.replace(next);
      return;
    }

    if (code) {
      sb.auth.exchangeCodeForSession(code).then(() => {
        router.replace(next);
      }).catch(() => {
        router.replace(next);
      });
    } else {
      // implicit flow: session already set by detectSessionInUrl
      sb.auth.getSession().then(() => {
        router.replace(next);
      });
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/40">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-[14px] font-semibold text-ink-soft">로그인 처리 중…</p>
      </div>
    </div>
  );
}
