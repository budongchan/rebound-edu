"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/auth/select-role";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (authError) {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
      }
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-md mr-2">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <span className="text-2xl font-extrabold text-brand">리바운드</span>
          <span className="text-2xl font-extrabold text-gray-900">에듀</span>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h1 className="text-lg font-bold text-center mb-2">로그인</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Google 계정으로 간편하게 시작하세요
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9s.957 2.076.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          로그인 시{" "}
          <a href="/terms" target="_blank" className="text-gray-500 underline">이용약관</a>과{" "}
          <a href="/privacy" target="_blank" className="text-gray-500 underline">개인정보처리방침</a>에
          동의하는 것으로 간주합니다.
        </p>
      </div>

      <p className="text-center text-[13px] text-gray-500 mt-5">
        처음이신가요? Google 로그인으로 자동 가입됩니다
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
