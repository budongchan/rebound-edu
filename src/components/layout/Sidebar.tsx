"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { ROLE_MENUS, ROLE_LABELS, ROLE_COLORS } from "@/types";
import {
  BookOpen, Search, CreditCard, MessageSquare, Award,
  LayoutDashboard, Calendar, Users, Wallet, GraduationCap,
  Headphones, ClipboardCheck, Megaphone, CheckCircle,
  TrendingUp, Settings, Bell, Briefcase, LogOut, ArrowLeftRight,
  Menu, X,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Search, CreditCard, MessageSquare, Award,
  LayoutDashboard, Calendar, Users, Wallet, GraduationCap,
  Headphones, ClipboardCheck, Megaphone, CheckCircle,
  TrendingUp, Settings, Bell, Briefcase,
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

export default function Sidebar({ role, userName, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = ROLE_MENUS[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-[18px] border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-0.5">
          
            <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-sm">R</span>
            </div>
<span className="text-lg font-extrabold text-brand">리바운드</span>
          <span className="text-lg font-extrabold text-gray-900">에듀</span>
        </Link>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
          style={{ backgroundColor: ROLE_COLORS[role] }}
        >
          {userName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-400">{ROLE_LABELS[role]}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || BookOpen;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors w-full",
                isActive
                  ? "bg-brand-light text-brand font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              )}
            >
              <Icon
                size={18}
                className={isActive ? "text-brand" : "text-gray-400"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-2 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => router.push("/auth/select-role")}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full transition"
        >
          <ArrowLeftRight size={16} />
          <span>공간 전환</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full transition"
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일 햄버거 버튼 (헤더 왼쪽에 위치) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-white shadow-md border border-gray-200"
        aria-label="메뉴 열기"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-[248px] bg-white border-r border-gray-200 flex-col flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 슬라이드 사이드바 */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-[280px] bg-white z-[80] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
