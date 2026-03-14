"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, Users } from "lucide-react";

interface StudentRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  enrollmentCount: number;
}

export default function StaffStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: users } = await supabase
        .from("users")
        .select("id, name, email, phone, is_active, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (!users) { setLoading(false); return; }

      // Get enrollment counts
      const userIds = users.map((u) => u.id);
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("user_id")
        .in("user_id", userIds);

      const countMap: Record<string, number> = {};
      enrollments?.forEach((e) => {
        countMap[e.user_id] = (countMap[e.user_id] || 0) + 1;
      });

      setStudents(users.map((u) => ({
        ...u,
        enrollmentCount: countMap[u.id] || 0,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = search.trim()
    ? students.filter((s) =>
        s.name.includes(search.trim()) ||
        s.email.toLowerCase().includes(search.trim().toLowerCase()) ||
        (s.phone && s.phone.includes(search.trim()))
      )
    : students;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">학생 DB</h2>
        <span className="text-sm text-gray-400">총 {students.length}명</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="이름, 이메일, 전화번호로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">학생이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">이름</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">이메일</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">전화번호</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">수강</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.phone || "-"}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{s.enrollmentCount}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={s.is_active ? "green" : "gray"}>
                      {s.is_active ? "활성" : "비활성"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
