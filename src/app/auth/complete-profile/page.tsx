"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: "student", label: "고객(수강생)", desc: "바로 이용 가능" },
  { value: "teacher", label: "전문가(강사)", desc: "관리자 승인 필요" },
];

const PRIVACY_POLICY = `주식회사 리바운드(이하 '회사')는 리바운드에듀 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.

1. 수집하는 개인정보 항목
  - 필수: 이름, 이메일 주소, 연락처(휴대전화번호)
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
  - 필수 항목에 대한 동의를 거부할 경우 회원가입이 제한될 수 있습니다.`;

const MARKETING_POLICY = `마케팅 정보 수신에 동의하시면 리바운드에듀의 신규 강의 오픈, 할인 이벤트, 전문가 특강 안내 등 유익한 정보를 이메일 및 SMS/카카오톡으로 받아보실 수 있습니다. 동의하지 않으셔도 서비스 이용에 제한은 없으며, 수신 동의 후에도 언제든지 설정에서 변경하실 수 있습니다.`;

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMarketing, setShowMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // 기존 프로필 정보 불러오기
      const { data: profile } = await supabase
        .from("users")
        .select("name, phone, email")
        .eq("auth_id", user.id)
        .single();

      if (profile) {
        if (profile.name) setName(profile.name);
        if (profile.phone) {
          // 이미 phone 있으면 이 페이지에 올 이유 없음
          router.push("/auth/select-role");
          return;
        }
        setUserEmail(profile.email || user.email || "");
      } else {
        setUserEmail(user.email || "");
        setName(user.user_metadata?.name || user.user_metadata?.full_name || "");
      }

      setInitialLoading(false);
    };
    load();
  }, [router]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("이름을 입력해주세요.");
    if (!phone.trim()) return setError("연락처를 입력해주세요.");
    if (phone.replace(/[^0-9]/g, "").length < 10)
      return setError("올바른 연락처를 입력해주세요.");
    if (!agreePrivacy)
      return setError("개인정보 수집 및 이용에 동의해주세요.");

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        phone: phone.replace(/[^0-9]/g, ""),
        role,
        is_approved: role === "student",
      })
      .eq("auth_id", user.id);

    if (updateErr) {
      setError("정보 저장에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (role !== "student") {
      // 전문가는 승인 대기 안내
      router.push("/auth/pending");
    } else {
      const redirectPath = redirect && redirect.startsWith("/") ? redirect : "/auth/select-role";
      router.push(redirectPath);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    );
  }

  return (
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
        <h1 className="text-lg font-bold text-center mb-2">추가 정보 입력</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          서비스 이용을 위해 아래 정보를 입력해주세요
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-5">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full h-11 px-3.5 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="홍길동"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={13}
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
                  <p className={`text-sm font-semibold ${role === opt.value ? "text-brand" : "text-gray-900"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${role === opt.value ? "text-orange-700" : "text-gray-400"}`}>
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
              <span className="text-sm font-semibold text-gray-900">전체 동의합니다</span>
            </label>

            {/* 개인정보 (필수) */}
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
                    <span className="text-red-500 font-semibold">[필수]</span> 개인정보 수집 및 이용 동의
                  </span>
                </label>
                <button type="button" onClick={() => setShowPrivacy(!showPrivacy)} className="text-gray-400 hover:text-gray-600 p-1">
                  {showPrivacy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {showPrivacy && (
                <div className="px-3 pb-3">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                    <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap">{PRIVACY_POLICY}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 마케팅 (선택) */}
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
                    <span className="text-gray-400 font-semibold">[선택]</span> 마케팅 정보 수신 동의
                  </span>
                </label>
                <button type="button" onClick={() => setShowMarketing(!showMarketing)} className="text-gray-400 hover:text-gray-600 p-1">
                  {showMarketing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {showMarketing && (
                <div className="px-3 pb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap">{MARKETING_POLICY}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? "처리 중..." : "가입 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        }
      >
        <CompleteProfileForm />
      </Suspense>
    </div>
  );
}
