export const INSTRUCTORS = {
  "김동찬 대표": {
    name: "김동찬",
    title: "리바운드 그룹 대표",
    bio: "현직 공인중개사법인 CEO이자 부동산 개발·투자 실전 전문가. KAIST MBA 출신으로 100개+ 센터 오픈, 다수 건물 투자·개발 경력을 보유하고 있습니다. 강의에서 이론이 아닌 현장에서 직접 겪은 실수와 성공 경험을 전달합니다.",
    credentials: ["공인중개사법인 대표이사", "KAIST MBA", "100개+ 센터 오픈 경험", "부동산 개발·투자 실전"],
    initial: "K",
    color: "#14110f",
  },
  "리바운드에듀": {
    name: "리바운드에듀",
    title: "리바운드 교육팀",
    bio: "리바운드 그룹의 교육 전문 팀. 부동산·AI·재테크 현장 전문가들이 수강생의 수준과 목표에 맞춰 체계적인 커리큘럼을 설계합니다. 실무 사례 중심의 강의로 배운 것을 바로 적용할 수 있도록 돕습니다.",
    credentials: ["부동산·AI·재테크 전문가 그룹", "실무 사례 중심 커리큘럼", "단계별 맞춤 설계"],
    initial: "R",
    color: "#7c3aed",
  },
};

export function getInstructor(name) {
  return INSTRUCTORS[name] || INSTRUCTORS["리바운드에듀"];
}
