"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-md mr-2">
              <span className="text-white font-black text-xl">R</span>
            </div>
            <span className="text-2xl font-extrabold text-brand">리바운드</span>
            <span className="text-2xl font-extrabold text-gray-900">에듀</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h1 className="text-lg font-bold text-center mb-2">회원가입</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Google 계정 하나로 3초 만에 가입하세요
          </p>

          <button
            onClick={handleGoogleSignup}
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
                Google로 시작하기
              </>
            )}
          </button>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-600">Google 로그인 한 번으로 가입 완료</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-600">별도 비밀번호 없이 안전하게 이용</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-600">추가 정보 입력 후 바로 강의 수강 가능</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
            가입 시{" "}
            <a href="/terms" target="_blank" className="text-gray-500 underline">이용약관</a>과{" "}
            <a href="/privacy" target="_blank" className="text-gray-500 underline">개인정보처리방침</a>에
            동의하는 것으로 간주합니다.
          </p>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-5">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-brand font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
