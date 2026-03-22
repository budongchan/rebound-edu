"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: "student", label: "고객(수강생)", desc: "바로 이용 가능" },
  { value: "teacher", label: "전문가(강사)", desc: "관리자 승인 필요" },
];

const PRIVACY_POLICY = `주식회사 리바운드(이하 '회사')는 리바운드에듀 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.

1. 수집하는 개인정보 항목
  - 필수: 이름, 이메일 주소, 비밀번호, 연락처(휴대전화번호)
  - 선택: 관심 분야, 프로필 사진

2. 개인정보의 수집·이용 목적
  - 회원 가입 및 본인 확인
  - 서비스 제공 및 수강 관리
  - 강의 결제 및 환불 처리
  - 고객 상담 및 공지사항 전달
  - 수료증 발급
  - 서비스 개선을 위한 통계 분석

3. 개인정보의 보유 및 이용 기간
  - 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지)
  - 전자상거래법에 따른 계약·결제 기록: 5년
  - 소비자 불만 또는 분쟁 처리 기록: 3년

4. 동의 거부권 및 불이익
  - 필수 항목에 대한 동의를 거부할 경우 회원가입이 제한될 수 있습니다.

5. 개인정보의 제3자 제공
  - 회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
  - 단, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.

6. 개인정보의 파기
  - 수집 목적이 달성되거나 보유 기간이 경과한 개인정보는 지체 없이 파기합니다.`;

const MARKETING_POLICY = `마케팅 정보 수신에 동의하시면 리바운드에듀의 신규 강의 오픈, 할인 이벤트, 전문가 특강 안내 등 유익한 정보를 이메일 및 SMS/카카오톡으로 받아보실 수 있습니다. 동의하지 않으셔도 서비스 이용에 제한은 없으며, 수신 동의 후에도 언제든지 설정에서 변경하실 수 있습니다.`;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMarketing, setShowMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    update("phone", formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("이름을 입력해주세요.");
    if (!form.phone.trim()) return setError("연락처를 입력해주세요.");
    if (form.phone.replace(/[^0-9]/g, "").length < 10)
      return setError("올바른 연락처를 입력해주세요.");
    if (form.password.length < 8)
      return setError("비밀번호는 8자 이상이어야 합니다.");
    if (form.password !== form.confirm)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!agreePrivacy)
      return setError("개인정보 수집 및 이용에 동의해주세요.");

    setLoading(true);
    const supabase = createClient();

    // 1. Supabase Auth 회원가입
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    });

    if (authErr) {
      setError(
        authErr.message.includes("already registered")
          ? "이미 가입된 이메일입니다."
          : "회원가입에 실패했습니다. 다시 시도해주세요."
      );
      setLoading(false);
      return;
    }

    // 2. users 테이블에 프로필 저장
    if (data.user) {
      await supabase.from("users").insert({
        auth_id: data.user.id,
        email: form.email,
        name: form.name,
        phone: form.phone.replace(/[^0-9]/g, ""),
        role,
        is_approved: role === "student",
        is_active: true,
      });
    }

    // 3. 학생(고객)은 바로 로그인 처리
    if (role === "student") {
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      setLoading(false);

      if (!loginErr) {
        router.push("/auth/select-role");
        return;
      }
      // 로그인 실패 시 (이메일 인증 필요 등) → 완료 화면 표시
    }

    setLoading(false);
    setSubmitted(true);
  };

  // 완료 화면 (전문가/직원 등 승인 필요한 경우)
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
                <svg width="28" height="28" fill="none" stroke="#E67700" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              )}
            </div>
            <h2 className="text-lg font-bold mb-2">
              {needsApproval ? "가입 신청 완료" : "회원가입 완료!"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {needsApproval ? (
                <>
                  전문가 계정으로 가입 신청되었습니다.
                  <br />
                  관리자 승인 후 이용 가능합니다.
                </>
              ) : (
                <>
                  고객 계정이 생성되었습니다.
                  <br />
                  로그인하여 강의를 시작하세요!
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[440px]">
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
          <h1 className="text-lg font-bold text-center mb-6">회원가입</h1>

          {/* 소셜 로그인 */}
          <button
            type="button"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "kakao",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            className="w-full h-12 rounded-lg bg-[#FEE500] text-[#391B1B] text-sm font-semibold hover:bg-[#F5DD00] transition flex items-center justify-center gap-3 mb-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0.6C4.029 0.6 0 3.713 0 7.55c0 2.486 1.656 4.672 4.148 5.907l-1.058 3.883c-.093.344.303.614.594.407L7.87 14.94c.37.038.746.06 1.13.06 4.971 0 9-3.113 9-6.95S13.971.6 9 .6z" fill="#391B1B"/>
            </svg>
            카카오로 간편 가입
          </button>
          <button
            type="button"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            className="w-full h-12 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9s.957 2.076.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 가입
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는 이메일로 가입</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* 입력 필드 */}
            <div className="space-y-3 mb-5">
              {/* 이름 */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="홍길동"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  required
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={13}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                  이메일 (로그인용) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="8자 이상"
                  required
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="비밀번호 재입력"
                  required
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
            </div>

            {/* 가입 유형 */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-gray-600 mb-2.5">
                가입 유형 <span className="text-red-500">*</span>
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
            </div>

            {/* 약관 동의 */}
            <div className="mb-5 space-y-2">
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">
                약관 동의
              </label>

              {/* 전체 동의 */}
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy && agreeMarketing}
                  onChange={(e) => {
                    setAgreePrivacy(e.target.checked);
                    setAgreeMarketing(e.target.checked);
                  }}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                />
                <span className="text-sm font-semibold text-gray-900">
                  전체 동의합니다
                </span>
              </label>

              {/* 개인정보 수집 동의 (필수) */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                    />
                    <span className="text-[13px] text-gray-700">
                      <span className="text-red-500 font-semibold">[필수]</span>{" "}
                      개인정보 수집 및 이용 동의
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPrivacy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {showPrivacy && (
                  <div className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                      <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {PRIVACY_POLICY}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 마케팅 수신 동의 (선택) */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={agreeMarketing}
                      onChange={(e) => setAgreeMarketing(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                    />
                    <span className="text-[13px] text-gray-700">
                      <span className="text-gray-400 font-semibold">[선택]</span>{" "}
                      마케팅 정보 수신 동의
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMarketing(!showMarketing)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showMarketing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {showMarketing && (
                  <div className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {MARKETING_POLICY}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                  : "전문가 가입 신청"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-5">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/auth/login"
            className="text-brand font-semibold hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
