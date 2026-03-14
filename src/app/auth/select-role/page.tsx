"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Calendar, Headphones, LayoutDashboard, ChevronRight } from "lucide-react";
import ChannelTalk from "@/components/ui/ChannelTalk";
import type { UserRole, User } from "@/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/types";

const ROLE_DESC: Record<UserRole, string> = {
  student: "강의 수강, Q&A, 수료증",
  teacher: "강의 관리, 스케줄, 정산",
  staff: "학생·교사 DB, CS, 검수",
  admin: "전체 관리, 매출, 설정",
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  student: BookOpen,
  teacher: Calendar,
  staff: Headphones,
  admin: LayoutDashboard,
};

export default function SelectRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (profile) {
        setUser(profile as User);
        // 사용자의 승인된 역할들 (데모에서는 해당 역할만)
        // 실제로는 user_roles 조인 테이블로 복수 역할 지원 가능
        const roles: UserRole[] = [profile.role as UserRole];
        // admin은 모든 역할 접근 가능
        if (profile.role === "admin") {
          setAvailableRoles(["student", "teacher", "staff", "admin"]);
        } else {
          setAvailableRoles(roles);
        }
      }
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-brand">리바운드</span>
          <span className="text-2xl font-extrabold text-gray-900">에듀</span>
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" fill="none" stroke="#FF6600" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-1">
              {user?.name || "사용자"}님, 안녕하세요
            </h1>
            <p className="text-sm text-gray-500">접속할 공간을 선택해주세요</p>
          </div>

          <div className="space-y-2">
            {availableRoles.map((r) => {
              const Icon = ROLE_ICONS[r];
              const color = ROLE_COLORS[r];
              return (
                <button
                  key={r}
                  onClick={() => router.push(`/${r}`)}
                  className="flex items-center gap-3.5 w-full p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + "18", color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-gray-900">
                      {ROLE_LABELS[r]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{ROLE_DESC[r]}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-5">
          <Link href="/auth/login" className="text-brand hover:underline">
            ← 다른 계정으로 로그인
          </Link>
        </p>
      </div>
      <ChannelTalk />
    </div>
  );
}
