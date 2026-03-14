"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { ROLE_MENUS, ROLE_LABELS, ROLE_COLORS } from "@/types";
import {
  BookOpen, Search, CreditCard, MessageSquare, Award,
  LayoutDashboard, Calendar, Users, Wallet, GraduationCap,
  Headphones, ClipboardCheck, Megaphone, CheckCircle,
  TrendingUp, Settings, Bell, LogOut, ArrowLeftRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Search, CreditCard, MessageSquare, Award,
  LayoutDashboard, Calendar, Users, Wallet, GraduationCap,
  Headphones, ClipboardCheck, Megaphone, CheckCircle,
  TrendingUp, Settings, Bell,
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

  return (
    <aside className="w-[220px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-[18px] border-b border-gray-100">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <span className="text-lg font-extrabold text-brand">리바운드</span>
          <span className="text-lg font-extrabold text-gray-900">에듀</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
          style={{ backgroundColor: ROLE_COLORS[role] }}
        >
          {userName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
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
    </aside>
  );
}
