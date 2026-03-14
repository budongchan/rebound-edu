"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Users, Search } from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
}

interface StudentRow {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: "blue" | "green" | "gray" | "red" }> = {
  active: { label: "수강중", color: "blue" },
  completed: { label: "완강", color: "green" },
  expired: { label: "만료", color: "gray" },
  refunded: { label: "환불", color: "red" },
};

export default function TeacherStudentsPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", profile.id)
        .order("created_at", { ascending: false });

      setCourses(coursesData || []);
      if (coursesData && coursesData.length > 0) {
        setSelectedCourse("all");
      }
      setLoading(false);
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length === 0) return;
    loadStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, courses]);

  const loadStudents = async () => {
    const supabase = createClient();
    const courseIds = selectedCourse === "all"
      ? courses.map((c) => c.id)
      : [selectedCourse];

    if (courseIds.length === 0) return;

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id, status, progress_pct, enrolled_at, completed_at,
        user:users!enrollments_user_id_fkey(id, name, email)
      `)
      .in("course_id", courseIds)
      .order("enrolled_at", { ascending: false });

    const rows: StudentRow[] = (enrollments || []).map((e) => {
      const rawUser = e.user as { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
      const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
      return {
        enrollmentId: e.id,
        userId: u?.id || "",
        name: u?.name || "수강생",
        email: u?.email || "",
        status: e.status,
        progress_pct: e.progress_pct,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
      };
    });

    setStudents(rows);
  };

  const filteredStudents = search.trim()
    ? students.filter(
        (s) =>
          s.name.includes(search.trim()) ||
          s.email.toLowerCase().includes(search.trim().toLowerCase())
      )
    : students;

  // Stats
  const totalActive = students.filter((s) => s.status === "active").length;
  const totalCompleted = students.filter((s) => s.status === "completed").length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.progress_pct, 0) / students.length)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">수강생 현황</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">수강중</p>
          <p className="text-lg font-bold text-blue-600">{totalActive}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">완강</p>
          <p className="text-lg font-bold text-green-600">{totalCompleted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">평균 진도율</p>
          <p className="text-lg font-bold text-gray-900">{avgProgress}%</p>
        </div>
      </div>

      {/* Course filter + Search */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition bg-white"
        >
          <option value="all">전체 강의</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
          />
        </div>
      </div>

      {/* Student list */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">수강생이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">수강생</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">진도율</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">수강일</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.active;
                return (
                  <tr key={s.enrollmentId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={st.color}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.progress_pct === 100 ? "bg-green-500" : "bg-brand"
                            }`}
                            style={{ width: `${s.progress_pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{s.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(s.enrolled_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
