"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/40">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-[14px] font-semibold text-ink-soft">로그인 처리 중…</p>
      </div>
    </div>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sb = getSupabaseBrowser();
    // query string의 next 우선, 없으면 sessionStorage fallback
    const nextFromQuery = searchParams.get("next");
    const nextFromStorage = typeof window !== "undefined" ? sessionStorage.getItem("auth_next") : null;
    const next = nextFromQuery || nextFromStorage || "/";
    if (nextFromStorage) sessionStorage.removeItem("auth_next");
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
      sb.auth.getSession().then(() => {
        router.replace(next);
      });
    }
  }, [router, searchParams]);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
