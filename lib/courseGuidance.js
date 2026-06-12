import { getCourse } from "@/lib/courses";

export const DEFAULT_COURSE_INQUIRY_URL = "https://pf.kakao.com/_xkxdxgb/chat";

export const COURSE_LOCATIONS = {
  "rebound-jongno": {
    id: "rebound-jongno",
    name: "리바운드 종로점",
    address: "서울특별시 종로구 돈화문로 85, 리바운드 종로센터",
    naverPlaceUrl: `https://map.naver.com/p/search/${encodeURIComponent("리바운드오피스 종로점")}`,
  },
};

export function getCourseInquiryUrl(course) {
  return course?.inquiryUrl || DEFAULT_COURSE_INQUIRY_URL;
}

export function getCourseLocation(course) {
  if (!course) return null;
  if (course.classLocation) return course.classLocation;
  if (course.classLocationId && COURSE_LOCATIONS[course.classLocationId]) {
    return COURSE_LOCATIONS[course.classLocationId];
  }
  if (course.place === "리바운드 종로점") return COURSE_LOCATIONS["rebound-jongno"];
  if (course.place) {
    return {
      id: "course-place",
      name: course.place,
      address: "",
      naverPlaceUrl: "",
    };
  }
  return null;
}

export function buildCourseGuidance(courseOrId) {
  const course = typeof courseOrId === "string" ? getCourse(courseOrId) : courseOrId;
  const location = getCourseLocation(course);

  return {
    courseId: course?.id || "",
    courseTitle: course?.checkoutTitle || course?.title || "",
    schedule: course?.scheduleShort || course?.schedule || "",
    locationName: location?.name || course?.place || "",
    address: location?.address || "",
    naverPlaceUrl: location?.naverPlaceUrl || "",
    groupChatUrl: course?.groupChatUrl || "",
    groupChatLabel: course?.groupChatLabel || "단톡방 초대 링크는 개강 전 카카오톡으로 별도 안내드립니다.",
    inquiryUrl: getCourseInquiryUrl(course),
  };
}

export function mergeStoredGuidance(order) {
  const base = buildCourseGuidance(order?.course_id);
  return {
    ...base,
    courseTitle: order?.course_title || base.courseTitle,
    schedule: order?.course_schedule || base.schedule,
    locationName: order?.course_place || base.locationName,
    address: order?.course_address || base.address,
    naverPlaceUrl: order?.course_naver_place_url || base.naverPlaceUrl,
    groupChatUrl: order?.course_group_chat_url || base.groupChatUrl,
    inquiryUrl: order?.course_inquiry_url || base.inquiryUrl,
  };
}
