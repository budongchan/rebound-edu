"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChannelTalk from "@/components/ui/ChannelTalk";
import type { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: "student", label: "학생", desc: "바로 이용" },
  { value: "teacher", label: "교사", desc: "강사 신청" },
  { value: "staff", label: "직원", desc: "승인 필요" },
  { value: "admin", label: "관리자", desc: "승인 필요" },
];

const ROLE_DESC: Record<UserRole, string> = {
  student: "수강생으로 가입합니다. 바로 이용 가능합니다.",
  teacher: "강사로 가입합니다. 관리자 승인 후 이용 가능합니다.",
  staff: "운영 직원으로 가입합니다. 관리자 승인 후 이용 가능합니다.",
  admin: "관리자로 가입합니다. 기존 관리자 승인이 필요합니다.",
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
    if (form.password !== form.confirm) return setError("비밀번호가 일치하지 않습니다.");

    setLoading(true);
    const supabase = createClient();

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authErr) {
      setError(authErr.message.includes("already registered")
        ? "이미 가입된 이메일입니다."
        : "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").insert({
        auth_id: data.user.id,
        email: form.email,
        name: form.name,
        role,
        is_approved: role === "student",
        is_active: true,
      });
    }

    setLoading(false);
    setSubmitted(true);
  };

  // 완료 화면
  if (submitted) {
    const needsApproval = role !== "student";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="bg-white rounded-xl p-10 border border-gray-200">
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center ${
                needsApproval ? "bg-amber-50" : "bg-green-50"
              }`}
            >
              {needsApproval ? (
                <svg width="28" height="28" fill="none" stroke="#E67700" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
              )}
            </div>
            <h2 className="text-lg font-bold mb-2">
              {needsApproval ? "가입 신청 완료" : "회원가입 완료!"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {needsApproval ? (
                <>
                  {ROLE_OPTIONS.find((r) => r.value === role)?.label} 계정으로 가입
                  신청되었습니다.
                  <br />
                  관리자 승인 후 이용 가능합니다.
                </>
              ) : (
                <>
                  학생 계정이 생성되었습니다.
                  <br />
                  바로 로그인하여 강의를 시작하세요!
                </>
              )}
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full h-12 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition"
            >
              로그인 페이지로
            </button>
          </div>
        </div>
        <ChannelTalk />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-2xl font-extrabold text-brand">리바운드</span>
            <span className="text-2xl font-extrabold text-gray-900">에듀</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h1 className="text-lg font-bold text-center mb-6">회원가입</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-5">
              {[
                { key: "name", label: "이름", placeholder: "홍길동", type: "text" },
                { key: "email", label: "이메일", placeholder: "email@example.com", type: "email" },
                { key: "password", label: "비밀번호", placeholder: "8자 이상", type: "password" },
                { key: "confirm", label: "비밀번호 확인", placeholder: "비밀번호 재입력", type: "password" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                  />
                </div>
              ))}
            </div>

            {/* Role */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-gray-600 mb-2.5">
                가입 유형
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`p-3 rounded-lg text-left transition ${
                      role === opt.value
                        ? "border-2 border-brand bg-brand-light"
                        : "border border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        role === opt.value ? "text-brand" : "text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        role === opt.value ? "text-orange-700" : "text-gray-400"
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {ROLE_DESC[role]}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading
                ? "처리 중..."
                : role === "student"
                ? "회원가입"
                : "가입 신청"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-5">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-brand font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
      <ChannelTalk />
    </div>
  );
}
