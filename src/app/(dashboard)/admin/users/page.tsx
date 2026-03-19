"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type UserRole } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, Users, Shield } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, "blue" | "green" | "amber" | "red"> = {
  student: "blue",
  teacher: "green",
  staff: "amber",
  admin: "red",
};

const ROLE_FILTERS = [
  { value: "all", label: "전체" },
  { value: "student", label: "고객" },
  { value: "teacher", label: "전문가" },
  { value: "staff", label: "직원" },
  { value: "admin", label: "관리자" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("id, email, name, role, is_active, is_approved, created_at")
      .order("created_at", { ascending: false });

    setUsers((data as UserRow[]) || []);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    const supabase = createClient();
    await supabase.from("users").update({ is_approved: true }).eq("id", userId);
    setUsers(users.map((u) => (u.id === userId ? { ...u, is_approved: true } : u)));
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from("users").update({ is_active: !isActive }).eq("id", userId);
    setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !isActive } : u)));
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    const supabase = createClient();
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  let filtered = users;
  if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
  if (showPendingOnly) filtered = filtered.filter((u) => !u.is_approved && u.role !== "student");
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = users.filter((u) => !u.is_approved && u.role !== "student").length;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">사용자 관리</h2>
        <span className="text-sm text-gray-400">총 {users.length}명</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                roleFilter === f.value
                  ? "bg-brand text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              showPendingOnly
                ? "bg-red-500 text-white"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            승인 대기 ({pendingCount})
          </button>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
          />
        </div>
      </div>

      {/* User table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">사용자가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">사용자</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">역할</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">가입일</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-brand bg-white"
                    >
                      {ROLE_FILTERS.filter((r) => r.value !== "all").map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {u.is_active ? (
                        <Badge color="green">활성</Badge>
                      ) : (
                        <Badge color="gray">비활성</Badge>
                      )}
                      {!u.is_approved && u.role !== "student" && (
                        <Badge color="red">미승인</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!u.is_approved && u.role !== "student" && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-brand rounded hover:bg-brand-dark transition"
                        >
                          승인
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-2.5 py-1 text-xs rounded border transition ${
                          u.is_active
                            ? "text-red-500 border-red-200 hover:bg-red-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                        }`}
                      >
                        {u.is_active ? "차단" : "복원"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
