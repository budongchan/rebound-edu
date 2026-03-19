"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SERVICE_TYPE_LABELS } from "@/types";
import type { ServiceType } from "@/types";
import { ArrowLeft, Send } from "lucide-react";

interface ExpertOption {
  id: string;
  name: string;
  courses: { id: string; title: string }[];
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = Object.entries(
  SERVICE_TYPE_LABELS
).map(([value, label]) => ({ value: value as ServiceType, label }));

export default function NewCommissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [experts, setExperts] = useState<ExpertOption[]>([]);

  // Form state
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("consulting");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [clientMemo, setClientMemo] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      // 수강한 강의의 전문가 목록 가져오기
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          course:courses(
            id, title,
            instructor:users!courses_instructor_id_fkey(id, name)
          )
        `)
        .eq("user_id", profile.id)
        .eq("status", "active");

      // 전문가별로 그룹핑
      const expertMap = new Map<string, ExpertOption>();
      (enrollments || []).forEach((e) => {
        const course = Array.isArray(e.course) ? e.course[0] : e.course;
        if (!course) return;
        const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;
        if (!instructor) return;

        if (!expertMap.has(instructor.id)) {
          expertMap.set(instructor.id, {
            id: instructor.id,
            name: instructor.name,
            courses: [],
          });
        }
        expertMap.get(instructor.id)!.courses.push({
          id: course.id,
          title: course.title,
        });
      });

      setExperts(Array.from(expertMap.values()));
      setLoading(false);
    };
    load();
  }, [router]);

  // 전문가 선택 시 연결 가능한 강의 필터
  const selectedExpert = experts.find((e) => e.id === selectedExpertId);
  const availableCourses = selectedExpert?.courses || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpertId || !title.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { alert("프로필을 찾을 수 없습니다."); return; }

      const { error } = await supabase.from("commissions").insert({
        client_id: profile.id,
        expert_id: selectedExpertId,
        course_id: selectedCourseId || null,
        title: title.trim(),
        description: description.trim() || null,
        service_type: serviceType,
        estimated_amount: parseInt(estimatedAmount) || 0,
        client_memo: clientMemo.trim() || null,
        status: "requested",
      });

      if (error) {
        console.error("Commission insert error:", error);
        alert("의뢰 신청에 실패했습니다. 다시 시도해주세요.");
      } else {
        router.push("/student/commissions");
      }
    } catch (err) {
      console.error("Commission error:", err);
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <h2 className="text-base font-bold">새 의뢰 신청</h2>
      </div>

      {experts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-2">수강 중인 강의가 없어 의뢰할 전문가가 없습니다</p>
          <p className="text-sm text-gray-300 mb-4">
            먼저 강의를 수강하면 해당 전문가에게 의뢰를 신청할 수 있습니다
          </p>
          <button
            onClick={() => router.push("/student/explore")}
            className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
          >
            강의 탐색하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 전문가 선택 */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              전문가 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedExpertId}
              onChange={(e) => {
                setSelectedExpertId(e.target.value);
                setSelectedCourseId("");
              }}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            >
              <option value="">전문가를 선택하세요</option>
              {experts.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.courses.length}개 강의 수강)
                </option>
              ))}
            </select>
          </div>

          {/* 연결 강의 */}
          {selectedExpertId && availableCourses.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                연결 강의 (선택)
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                <option value="">강의를 선택하세요 (선택사항)</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1.5">
                의뢰와 관련된 강의가 있다면 선택해주세요
              </p>
            </div>
          )}

          {/* 서비스 유형 */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              서비스 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_TYPES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setServiceType(st.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition ${
                    serviceType === st.value
                      ? "border-brand bg-brand-light text-brand"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 + 설명 */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                의뢰 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 숙박업 사업계획서 작성 의뢰"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                상세 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="원하시는 작업 내용, 기대하는 결과물 등을 자세히 설명해주세요"
                rows={5}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
              />
            </div>
          </div>

          {/* 예산 + 메모 */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                희망 예산 (원)
              </label>
              <input
                type="number"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                placeholder="예: 500000"
                min="0"
                step="10000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                정확한 금액은 전문가와 협의 후 확정됩니다
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                추가 요청 사항
              </label>
              <textarea
                value={clientMemo}
                onChange={(e) => setClientMemo(e.target.value)}
                placeholder="전문가에게 전달할 추가 메모를 입력하세요"
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedExpertId || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "신청 중..." : "의뢰 신청"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
