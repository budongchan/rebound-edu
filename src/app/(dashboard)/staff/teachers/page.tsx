"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, GraduationCap } from "lucide-react";

interface TeacherRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  courseCount: number;
  studentCount: number;
}

export default function StaffTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: users } = await supabase
        .from("users")
        .select("id, name, email, phone, is_active, is_approved, created_at")
        .eq("role", "teacher")
        .order("created_at", { ascending: false });

      if (!users) { setLoading(false); return; }

      const teacherIds = users.map((u) => u.id);

      // Course counts
      const { data: courses } = await supabase
        .from("courses")
        .select("instructor_id")
        .in("instructor_id", teacherIds);

      const courseMap: Record<string, number> = {};
      courses?.forEach((c) => {
        courseMap[c.instructor_id] = (courseMap[c.instructor_id] || 0) + 1;
      });

      // Student counts via enrollments
      const { data: courseIds } = await supabase
        .from("courses")
        .select("id, instructor_id")
        .in("instructor_id", teacherIds);

      const instrCourseMap: Record<string, string[]> = {};
      courseIds?.forEach((c) => {
        if (!instrCourseMap[c.instructor_id]) instrCourseMap[c.instructor_id] = [];
        instrCourseMap[c.instructor_id].push(c.id);
      });

      const allCourseIds = courseIds?.map((c) => c.id) || [];
      const { data: enrollments } = allCourseIds.length > 0
        ? await supabase.from("enrollments").select("course_id").in("course_id", allCourseIds)
        : { data: [] };

      const studentMap: Record<string, number> = {};
      teacherIds.forEach((tid) => {
        const myCourseIds = instrCourseMap[tid] || [];
        studentMap[tid] = (enrollments || []).filter((e) => myCourseIds.includes(e.course_id)).length;
      });

      setTeachers(users.map((u) => ({
        ...u,
        courseCount: courseMap[u.id] || 0,
        studentCount: studentMap[u.id] || 0,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = search.trim()
    ? teachers.filter((t) =>
        t.name.includes(search.trim()) || t.email.toLowerCase().includes(search.trim().toLowerCase())
      )
    : teachers;

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
        <h2 className="text-base font-bold">교사 DB</h2>
        <span className="text-sm text-gray-400">총 {teachers.length}명</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="이름 또는 이메일로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <GraduationCap className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">교사가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">이름</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">이메일</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">강의</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">수강생</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.email}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{t.courseCount}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{t.studentCount}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Badge color={t.is_active ? "green" : "gray"}>
                        {t.is_active ? "활성" : "비활성"}
                      </Badge>
                      {!t.is_approved && <Badge color="red">미승인</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
