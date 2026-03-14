"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Trash2 } from "lucide-react";

interface Schedule {
  id: string;
  type: string;
  title: string;
  memo: string | null;
  location: string | null;
  start_at: string;
  end_at: string;
  course: { title: string } | null;
}

const TYPE_MAP: Record<string, { label: string; color: "blue" | "amber" | "green" | "red" | "gray" }> = {
  filming: { label: "촬영", color: "blue" },
  rehearsal: { label: "리허설", color: "amber" },
  free_lecture: { label: "무료특강", color: "green" },
  main_lecture: { label: "본강의", color: "red" },
  editing_review: { label: "편집검토", color: "gray" },
  other: { label: "기타", color: "gray" },
};

const TYPE_OPTIONS = [
  { value: "filming", label: "촬영" },
  { value: "rehearsal", label: "리허설" },
  { value: "free_lecture", label: "무료특강" },
  { value: "main_lecture", label: "본강의" },
  { value: "editing_review", label: "편집검토" },
  { value: "other", label: "기타" },
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form
  const [formType, setFormType] = useState("filming");
  const [formTitle, setFormTitle] = useState("");
  const [formMemo, setFormMemo] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formStartTime, setFormStartTime] = useState("10:00");
  const [formEndTime, setFormEndTime] = useState("12:00");
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadSchedules = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("users").select("id").eq("auth_id", user.id).single();
    if (!profile) { setLoading(false); return; }
    setProfileId(profile.id);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from("schedules")
      .select("id, type, title, memo, location, start_at, end_at, course:courses(title)")
      .eq("user_id", profile.id)
      .gte("start_at", start)
      .lte("start_at", end)
      .order("start_at");

    setSchedules((data || []).map((s) => ({
      ...s,
      course: Array.isArray(s.course) ? s.course[0] : s.course,
    })));
    setLoading(false);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openAddModal = (dateStr?: string) => {
    setSelectedDate(dateStr || new Date().toISOString().slice(0, 10));
    setFormType("filming");
    setFormTitle("");
    setFormMemo("");
    setFormLocation("");
    setFormStartTime("10:00");
    setFormEndTime("12:00");
    setShowModal(true);
  };

  const handleAddSchedule = async () => {
    if (!profileId || !formTitle.trim() || !selectedDate) return;
    setFormSaving(true);

    const supabase = createClient();
    const startAt = `${selectedDate}T${formStartTime}:00`;
    const endAt = `${selectedDate}T${formEndTime}:00`;

    await supabase.from("schedules").insert({
      user_id: profileId,
      type: formType,
      title: formTitle.trim(),
      memo: formMemo.trim() || null,
      location: formLocation.trim() || null,
      start_at: startAt,
      end_at: endAt,
    });

    setShowModal(false);
    setFormSaving(false);
    await loadSchedules();
  };

  const handleDeleteSchedule = async (id: string) => {
    const supabase = createClient();
    await supabase.from("schedules").delete().eq("id", id);
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  // Calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return schedules.filter((s) => s.start_at.startsWith(dateStr));
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
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">스케줄</h2>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
        >
          <Plus size={16} /> 일정 추가
        </button>
      </div>

      {/* Calendar header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded transition">
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-bold">
            {year}년 {MONTHS[month]}
          </h3>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded transition">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-[11px] font-medium py-1.5 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-[80px]" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const daySchedules = getSchedulesForDay(day);

            return (
              <div
                key={day}
                onClick={() => openAddModal(dateStr)}
                className="h-[80px] border border-gray-50 p-1 cursor-pointer hover:bg-gray-50 transition"
              >
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "bg-brand text-white w-5 h-5 rounded-full inline-flex items-center justify-center"
                      : "text-gray-600"
                  }`}
                >
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {daySchedules.slice(0, 2).map((s) => {
                    const t = TYPE_MAP[s.type] || TYPE_MAP.other;
                    return (
                      <div
                        key={s.id}
                        className="text-[10px] truncate px-1 py-0.5 rounded bg-gray-50"
                        title={s.title}
                      >
                        <Badge color={t.color}>{t.label}</Badge>
                      </div>
                    );
                  })}
                  {daySchedules.length > 2 && (
                    <p className="text-[9px] text-gray-400 text-center">+{daySchedules.length - 2}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming schedules list */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold mb-3">이번 달 일정 ({schedules.length})</h3>
        {schedules.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
            이번 달 일정이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => {
              const t = TYPE_MAP[s.type] || TYPE_MAP.other;
              const d = new Date(s.start_at);
              const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[40px]">
                      <p className="text-xs font-bold text-gray-700">{d.getDate()}</p>
                      <p className="text-[10px] text-gray-400">{DAYS[d.getDay()]}</p>
                    </div>
                    <Badge color={t.color}>{t.label}</Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-400">
                        {timeStr}{s.location ? ` · ${s.location}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add schedule modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-[420px] p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold">일정 추가</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">날짜</label>
                <input
                  type="date"
                  value={selectedDate || ""}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">유형</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition bg-white"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">제목 *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="일정 제목"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">장소</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="장소 (선택)"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">메모</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="메모 (선택)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={formSaving || !formTitle.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
              >
                {formSaving ? "저장 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
