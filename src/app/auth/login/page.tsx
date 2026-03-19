"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/auth/select-role";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
  };

  const handleKakaoLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <span className="text-2xl font-extrabold text-brand">리바운드</span>
          <span className="text-2xl font-extrabold text-gray-900">에듀</span>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h1 className="text-lg font-bold text-center mb-6">로그인</h1>

        {/* Kakao Login */}
        <button
          onClick={handleKakaoLogin}
          className="w-full h-12 rounded-lg bg-[#FEE500] text-[#391B1B] text-sm font-semibold hover:bg-[#F5DD00] transition flex items-center justify-center gap-3 mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 0.6C4.029 0.6 0 3.713 0 7.55c0 2.486 1.656 4.672 4.148 5.907l-1.058 3.883c-.093.344.303.614.594.407L7.87 14.94c.37.038.746.06 1.13.06 4.971 0 9-3.113 9-6.95S13.971.6 9 .6z" fill="#391B1B"/>
          </svg>
          카카오로 시작하기
        </button>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9s.957 2.076.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 로그인
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는 이메일로 로그인</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email */}
        <form onSubmit={handleLogin} className="space-y-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
            className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
          />

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          비밀번호를 잊으셨나요?{" "}
          <span className="text-brand cursor-pointer hover:underline">
            비밀번호 찾기
          </span>
        </p>
      </div>

      <p className="text-center text-[13px] text-gray-500 mt-5">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/auth/signup"
          className="text-brand font-semibold hover:underline"
        >
          회원가입
        </Link>
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
