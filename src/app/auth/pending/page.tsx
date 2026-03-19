"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Clock, LogOut, RefreshCw } from "lucide-react";

import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name, role, is_approved")
        .eq("auth_id", user.id)
        .single();

      if (!profile) {
        router.push("/auth/login");
        return;
      }

      // 이미 승인된 경우 역할 선택으로
      if (profile.is_approved) {
        router.push("/auth/select-role");
        return;
      }

      setUserName(profile.name || "사용자");
      setUserRole(profile.role as UserRole);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleCheckApproval = async () => {
    setChecking(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("is_approved")
        .eq("auth_id", user.id)
        .single();

      if (profile?.is_approved) {
        router.push("/auth/select-role");
        return;
      }
    }
    setChecking(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-2xl font-extrabold text-brand">리바운드</span>
            <span className="text-2xl font-extrabold text-gray-900">에듀</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-500" />
          </div>

          <h1 className="text-lg font-bold text-gray-900 mb-2">
            승인 대기 중입니다
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            <strong className="text-gray-700">{userName}</strong>님의{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              {userRole ? ROLE_LABELS[userRole] : ""}
            </span>{" "}
            계정이 관리자 승인을 기다리고 있습니다.
            <br />
            승인이 완료되면 로그인하여 이용하실 수 있습니다.
          </p>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-[13px] text-gray-600 leading-relaxed">
              <strong className="text-gray-800">안내사항</strong>
            </p>
            <ul className="mt-2 space-y-1.5 text-[13px] text-gray-500">
              <li className="flex gap-2">
                <span className="text-brand">•</span>
                승인은 관리자가 확인 후 처리합니다.
              </li>
              <li className="flex gap-2">
                <span className="text-brand">•</span>
                일반적으로 1~2 영업일 내에 처리됩니다.
              </li>
              <li className="flex gap-2">
                <span className="text-brand">•</span>
                문의사항은 우측 하단 상담 버튼을 이용해주세요.
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleCheckApproval}
              disabled={checking}
              className="w-full h-11 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
              {checking ? "확인 중..." : "승인 상태 확인"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              다른 계정으로 로그인
            </button>
          </div>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-5">
          승인 관련 문의: admin@rebound.io.kr
        </p>
      </div>
    </div>
  );
}
