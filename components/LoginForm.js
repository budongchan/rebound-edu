"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) { setChecking(false); return; }
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
      else setChecking(false);
    });
  }, [next, router]);

  async function handleGoogle() {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError("로그인 서비스를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8">
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">
          R
        </span>
        <h1 className="mt-5 text-[20px] font-extrabold text-ink">리바운드에듀 로그인</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          {next.startsWith("/checkout")
            ? "결제를 진행하려면 먼저 로그인해 주세요."
            : "Google 계정으로 간편하게 시작하세요."}
        </p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-paper px-5 py-3.5 text-[14px] font-bold text-ink shadow-sm transition-all hover:border-ink/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
            <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.8 36.9 27 38 24 38c-6.1 0-11.2-4-13-9.5L4.1 34c3.5 7.3 10.7 12 19.9 12z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-1 2.8-2.9 5-5.4 6.6l6.6 5.6C41.5 36.6 46 31 46 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
        )}
        {loading ? "처리 중…" : "Google로 계속하기"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-brand/5 px-3 py-2.5 text-[13px] text-brand">
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-line pt-5 text-center">
        <Link
          href="/courses"
          className="text-[13px] font-semibold text-ink-soft hover:text-ink"
        >
          로그인 없이 강의 둘러보기 →
        </Link>
      </div>
    </div>
  );
}
