export const STUDENT_SURVEY_FIELDS = {
  startupType: "창업 유형",
  prepStartedMonth: "준비 시작한 시점",
  targetOpenMonth: "오픈 목표 시점",
  budget: "창업 예산",
  interestedArea: "관심 지역",
  residenceArea: "거주 지역",
  hospitalityExperience: "숙박업 경력",
  hasSupport: "주변 창업 도움 여부",
  supportDetail: "받을 수 있는 도움",
  hardestPoint: "창업 준비 중 가장 어려운 점",
  attendanceType: "수업 참석",
  fieldworkAvailability: "임장 가능 일정",
};

export const STARTUP_TYPE_OPTIONS = ["매입형", "임차형", "미정"];
export const HAS_SUPPORT_OPTIONS = ["예", "아니오", "아직 모르겠습니다"];
export const ATTENDANCE_TYPE_OPTIONS = ["오프라인", "온라인"];
export const FIELDWORK_AVAILABILITY_OPTIONS = ["평일낮", "주말낮"];

export function getSurveyUrl(orderId, baseUrl = "https://edu.rebound.io.kr") {
  if (!orderId) return "";
  const origin = String(baseUrl || "https://edu.rebound.io.kr").replace(/\/$/, "");
  return `${origin}/survey/${encodeURIComponent(orderId)}`;
}

export function normalizeStudentSurvey(input = {}) {
  const fieldworkAvailability = Array.isArray(input.fieldworkAvailability)
    ? input.fieldworkAvailability.filter((value) => FIELDWORK_AVAILABILITY_OPTIONS.includes(value))
    : [];

  return {
    startupType: STARTUP_TYPE_OPTIONS.includes(input.startupType) ? input.startupType : "",
    prepStartedMonth: String(input.prepStartedMonth || "").trim(),
    targetOpenMonth: String(input.targetOpenMonth || "").trim(),
    budget: String(input.budget || "").trim(),
    interestedArea: String(input.interestedArea || "").trim(),
    residenceArea: String(input.residenceArea || "").trim(),
    hospitalityExperience: String(input.hospitalityExperience || "").trim(),
    hasSupport: HAS_SUPPORT_OPTIONS.includes(input.hasSupport) ? input.hasSupport : "",
    supportDetail: String(input.supportDetail || "").trim(),
    hardestPoint: String(input.hardestPoint || "").trim(),
    attendanceType: ATTENDANCE_TYPE_OPTIONS.includes(input.attendanceType) ? input.attendanceType : "",
    fieldworkAvailability,
  };
}

export function validateStudentSurvey(input = {}) {
  const survey = normalizeStudentSurvey(input);
  const requiredFields = [
    "startupType",
    "prepStartedMonth",
    "targetOpenMonth",
    "budget",
    "interestedArea",
    "residenceArea",
    "hospitalityExperience",
    "hasSupport",
    "hardestPoint",
    "attendanceType",
  ];
  const missing = requiredFields.filter((field) => !survey[field]);
  if (!survey.fieldworkAvailability.length) missing.push("fieldworkAvailability");
  if (survey.hasSupport === "예" && !survey.supportDetail) missing.push("supportDetail");
  return { survey, missing };
}
