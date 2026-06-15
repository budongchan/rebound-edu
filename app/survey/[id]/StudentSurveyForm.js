"use client";

import { useState } from "react";
import {
  ATTENDANCE_TYPE_OPTIONS,
  FIELDWORK_AVAILABILITY_OPTIONS,
  HAS_SUPPORT_OPTIONS,
  STARTUP_TYPE_OPTIONS,
} from "@/lib/studentSurvey";

function Field({ label, required = true, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-black text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-brand"
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[14px] font-bold text-ink outline-none transition-colors focus:border-brand"
    >
      {children}
    </select>
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      rows={4}
      className="w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed text-ink outline-none transition-colors focus:border-brand"
    />
  );
}

export default function StudentSurveyForm({ order }) {
  const [form, setForm] = useState({
    startupType: "",
    prepStartedMonth: "",
    targetOpenMonth: "",
    budget: "",
    interestedArea: "",
    residenceArea: "",
    hospitalityExperience: "",
    hasSupport: "",
    supportDetail: "",
    hardestPoint: "",
    attendanceType: "",
    fieldworkAvailability: [],
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAvailability(value) {
    setForm((prev) => {
      const exists = prev.fieldworkAvailability.includes(value);
      return {
        ...prev,
        fieldworkAvailability: exists
          ? prev.fieldworkAvailability.filter((item) => item !== value)
          : [...prev.fieldworkAvailability, value],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/student-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.order_id, survey: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message || "제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setStatus("done");
      setMessage("사전 질문지가 제출되었습니다. 수업 준비에 반영하겠습니다.");
    } catch {
      setStatus("error");
      setMessage("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-[24px] font-black text-white">
          ✓
        </div>
        <h1 className="mt-5 text-[26px] font-black text-ink">제출 완료</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <div className="border-b border-line pb-5">
        <p className="text-[13px] font-bold uppercase tracking-widest text-brand">Pre-Class Survey</p>
        <h1 className="mt-2 text-[28px] font-black text-ink">수강생 사전 질문지</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          창업 방향과 현재 준비 상태를 확인해 수업·임장·상담에 반영합니다.
        </p>
        <div className="mt-4 rounded-xl bg-cream/70 p-4 text-[13px] leading-relaxed text-ink-soft">
          <p className="font-black text-ink">{order.course_title}</p>
          <p className="mt-1">주문번호: {order.order_id}</p>
          <p>수강생: {order.buyer_name}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="창업 유형">
          <SelectInput value={form.startupType} onChange={(event) => update("startupType", event.target.value)}>
            <option value="">선택해 주세요</option>
            {STARTUP_TYPE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </SelectInput>
        </Field>

        <Field label="창업 예산">
          <TextInput value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="예: 1억원, 3억원, 미정" />
        </Field>

        <Field label="준비 시작한 시점">
          <TextInput type="month" value={form.prepStartedMonth} onChange={(event) => update("prepStartedMonth", event.target.value)} />
        </Field>

        <Field label="오픈 목표 시점">
          <TextInput type="month" value={form.targetOpenMonth} onChange={(event) => update("targetOpenMonth", event.target.value)} />
        </Field>

        <Field label="관심 지역">
          <TextInput value={form.interestedArea} onChange={(event) => update("interestedArea", event.target.value)} placeholder="예: 종로, 마포, 을지로" />
        </Field>

        <Field label="거주 지역">
          <TextInput value={form.residenceArea} onChange={(event) => update("residenceArea", event.target.value)} placeholder="예: 서울 성북구" />
        </Field>

        <Field label="수업 참석">
          <SelectInput value={form.attendanceType} onChange={(event) => update("attendanceType", event.target.value)}>
            <option value="">선택해 주세요</option>
            {ATTENDANCE_TYPE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </SelectInput>
        </Field>

        <Field label="임장 가능 일정">
          <div className="grid grid-cols-2 gap-2">
            {FIELDWORK_AVAILABILITY_OPTIONS.map((option) => {
              const checked = form.fieldworkAvailability.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleAvailability(option)}
                  className={`rounded-xl border px-4 py-3 text-[14px] font-black transition-colors ${
                    checked ? "border-brand bg-brand text-white" : "border-line bg-paper text-ink"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="숙박업 경력">
          <TextArea value={form.hospitalityExperience} onChange={(event) => update("hospitalityExperience", event.target.value)} placeholder="숙박업 운영, 중개, 투자, 관련 업무 경험이 있다면 적어 주세요. 없으면 '없음'으로 적어 주세요." />
        </Field>

        <Field label="주변에 창업 관련 도움 주시는 분이 있나요?">
          <SelectInput value={form.hasSupport} onChange={(event) => update("hasSupport", event.target.value)}>
            <option value="">선택해 주세요</option>
            {HAS_SUPPORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </SelectInput>
        </Field>

        <Field label="어떤 도움을 받을 수 있나요?" required={form.hasSupport === "예"}>
          <TextArea value={form.supportDetail} onChange={(event) => update("supportDetail", event.target.value)} placeholder="예: 건축사 지인, 시공 견적 도움, 자금 조달 상담, 운영 경험자 조언 등" />
        </Field>

        <Field label="창업 준비하면서 가장 어려운 점">
          <TextArea value={form.hardestPoint} onChange={(event) => update("hardestPoint", event.target.value)} placeholder="현재 가장 막히는 지점이나 수업에서 꼭 해결하고 싶은 질문을 적어 주세요." />
        </Field>
      </div>

      {message && (
        <p className={`mt-5 rounded-xl p-4 text-[13px] font-bold ${status === "error" ? "bg-brand/5 text-brand" : "bg-cream text-ink-soft"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-7 w-full rounded-xl bg-brand px-5 py-4 text-[15px] font-black text-white disabled:opacity-60"
      >
        {status === "loading" ? "제출 중..." : "사전 질문지 제출하기"}
      </button>
    </form>
  );
}
