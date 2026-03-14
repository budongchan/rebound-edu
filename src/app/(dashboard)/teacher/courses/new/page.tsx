"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/types";
import Badge from "@/components/ui/Badge";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Send } from "lucide-react";

interface LectureForm {
  id?: string;
  section_title: string;
  order_num: number;
  title: string;
  duration_sec: number;
  is_preview: boolean;
}

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "입문" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
];

export default function CourseFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Course fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("vacancy");
  const [difficulty, setDifficulty] = useState("beginner");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  // Lectures
  const [lectures, setLectures] = useState<LectureForm[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) return;
      setProfileId(profile.id);

      if (editId) {
        const { data: course } = await supabase
          .from("courses")
          .select("*")
          .eq("id", editId)
          .eq("instructor_id", profile.id)
          .single();

        if (course) {
          setTitle(course.title || "");
          setSubtitle(course.subtitle || "");
          setDescription(course.description || "");
          setCategory(course.category || "vacancy");
          setDifficulty(course.difficulty || "beginner");
          setPrice(course.price?.toString() || "");
          setDiscountPrice(course.discount_price?.toString() || "");

          const { data: lecs } = await supabase
            .from("lectures")
            .select("*")
            .eq("course_id", editId)
            .order("order_num");

          if (lecs) {
            setLectures(lecs.map((l) => ({
              id: l.id,
              section_title: l.section_title || "",
              order_num: l.order_num,
              title: l.title,
              duration_sec: l.duration_sec,
              is_preview: l.is_preview,
            })));
          }
        }
        setLoading(false);
      }
    };
    load();
  }, [editId, router]);

  const addLecture = () => {
    setLectures([
      ...lectures,
      {
        section_title: "",
        order_num: lectures.length + 1,
        title: "",
        duration_sec: 0,
        is_preview: false,
      },
    ]);
  };

  const updateLecture = (idx: number, field: keyof LectureForm, value: string | number | boolean) => {
    setLectures(lectures.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const removeLecture = (idx: number) => {
    setLectures(lectures.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order_num: i + 1 })));
  };

  const handleSave = async (submitForReview = false) => {
    if (!title.trim() || !profileId) return;
    setSaving(true);

    const supabase = createClient();
    const totalDuration = lectures.reduce((s, l) => s + l.duration_sec, 0);

    const courseData = {
      instructor_id: profileId,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      category,
      difficulty,
      price: parseInt(price) || 0,
      discount_price: discountPrice ? parseInt(discountPrice) : null,
      total_lectures: lectures.length,
      total_duration_sec: totalDuration,
      status: submitForReview ? "review" : "draft",
      ...(submitForReview ? { published_at: null } : {}),
    };

    let courseId = editId;

    if (editId) {
      await supabase.from("courses").update(courseData).eq("id", editId);
    } else {
      const { data: newCourse } = await supabase
        .from("courses").insert(courseData).select("id").single();
      if (newCourse) courseId = newCourse.id;
    }

    if (courseId) {
      // Delete existing lectures and re-insert
      if (editId) {
        await supabase.from("lectures").delete().eq("course_id", courseId);
      }

      if (lectures.length > 0) {
        const lecData = lectures.map((l) => ({
          course_id: courseId,
          section_title: l.section_title || null,
          order_num: l.order_num,
          title: l.title,
          duration_sec: l.duration_sec,
          is_preview: l.is_preview,
        }));
        await supabase.from("lectures").insert(lecData);
      }
    }

    setSaving(false);
    router.push("/teacher/courses");
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
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-bold">{editId ? "강의 편집" : "새 강의 만들기"}</h2>
      </div>

      <div className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold mb-4">기본 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">강의 제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="강의 제목을 입력하세요"
                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">부제목</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제목 (선택)"
                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">강의 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="강의에 대한 상세 설명"
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition bg-white"
                >
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">난이도</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition bg-white"
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">정가 (원)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">할인가 (원, 선택)</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="할인 없음"
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lectures */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">커리큘럼 ({lectures.length}강)</h3>
            <button
              onClick={addLecture}
              className="flex items-center gap-1 text-sm text-brand font-semibold hover:underline"
            >
              <Plus size={14} /> 차시 추가
            </button>
          </div>

          {lectures.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              아직 차시가 없습니다. 차시를 추가해보세요.
            </div>
          ) : (
            <div className="space-y-2">
              {lectures.map((l, idx) => (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-lg p-3.5 hover:border-gray-200 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={14} className="text-gray-300" />
                    <span className="text-xs text-gray-400 font-medium min-w-[24px]">
                      {l.order_num}강
                    </span>
                    <input
                      type="text"
                      value={l.title}
                      onChange={(e) => updateLecture(idx, "title", e.target.value)}
                      placeholder="차시 제목"
                      className="flex-1 h-8 px-2 border border-gray-200 rounded text-sm outline-none focus:border-brand transition"
                    />
                    <button
                      onClick={() => removeLecture(idx)}
                      className="text-gray-300 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 ml-9">
                    <input
                      type="text"
                      value={l.section_title}
                      onChange={(e) => updateLecture(idx, "section_title", e.target.value)}
                      placeholder="섹션명 (선택)"
                      className="w-[140px] h-7 px-2 border border-gray-100 rounded text-xs outline-none focus:border-brand transition"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={l.duration_sec > 0 ? Math.floor(l.duration_sec / 60) : ""}
                        onChange={(e) =>
                          updateLecture(idx, "duration_sec", (parseInt(e.target.value) || 0) * 60)
                        }
                        placeholder="분"
                        className="w-[60px] h-7 px-2 border border-gray-100 rounded text-xs outline-none focus:border-brand transition text-center"
                      />
                      <span className="text-xs text-gray-400">분</span>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={l.is_preview}
                        onChange={(e) => updateLecture(idx, "is_preview", e.target.checked)}
                        className="accent-brand"
                      />
                      미리보기
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/teacher/courses")}
            className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Save size={14} />
            초안 저장
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
          >
            <Send size={14} />
            검토 요청
          </button>
        </div>
      </div>
    </>
  );
}
