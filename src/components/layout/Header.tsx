"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import type { UserRole } from "@/types";
import { ROLE_MENUS } from "@/types";

export default function Header({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const menus = ROLE_MENUS[role];
  const current = menus.find(
    (m) => pathname === m.href || (m.href !== `/${role}` && pathname.startsWith(m.href))
  );

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-bold text-gray-900">
        {current?.label || "대시보드"}
      </h1>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
