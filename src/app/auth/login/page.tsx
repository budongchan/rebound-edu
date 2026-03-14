"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChannelTalk from "@/components/ui/ChannelTalk";

export default function LoginPage() {
  const router = useRouter();
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

    router.push("/auth/select-role");
  };

  const handleSocialLogin = async (provider: "kakao" | "google") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
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

          {/* Social */}
          <div className="space-y-2.5 mb-6">
            <button
              onClick={() => handleSocialLogin("kakao")}
              className="w-full h-12 rounded-lg font-semibold text-sm bg-[#FEE500] text-[#191919] hover:brightness-95 transition"
            >
              카카오 로그인
            </button>
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full h-12 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
            >
              Google 로그인
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">
                이메일로 로그인
              </span>
            </div>
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
      <ChannelTalk />
    </div>
  );
}
