// 강의 데이터 — 메타(제목/가격/할인/강수/카테고리)는 edu.rebound.io.kr 라이브 기준.
// 상세 본문(summary/highlights/target/curriculum)은 각 강의 주제 기반 편집 가능한 기본값.
// 운영 단계에서 Supabase courses 테이블로 이관 예정.

// 상단 메뉴 수업 분류 (5분류). intro = 과목별 페이지 소개 문구.
export const CATEGORIES = [
  { key: "all", label: "전체", color: "#14110f" },
  { key: "ai", label: "AI", color: "#7c3aed", intro: "ChatGPT 활용부터 자동화 시스템 설계까지, 실무에 바로 쓰는 AI 교육." },
  { key: "realestate", label: "부동산", color: "#2563eb", intro: "중개·숙박·공실·창업까지, 100개+ 센터 오픈 노하우를 담은 부동산 실전 교육." },
  { key: "language", label: "외국어", color: "#0f766e", intro: "비즈니스와 실생활에 바로 쓰는 외국어 과정. 곧 공개됩니다." },
  { key: "writing", label: "책쓰기", color: "#b45309", intro: "책 한 권으로 전문성을 증명한다. 기획부터 출간까지 책쓰기 과정. 곧 공개됩니다." },
  { key: "wealth", label: "재테크", color: "#e63329", intro: "내집마련·법인 활용·투자개발까지, 자산을 키우는 재테크 실전 전략." },
];

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);
export const CATEGORY_COLOR = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.color])
);
export const CATEGORY_INTRO = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.intro || ""])
);

// 상단 메뉴용 — '전체' 제외 실제 분류
export const MENU_CATEGORIES = CATEGORIES.filter((c) => c.key !== "all");

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || null;
}
export function coursesByCategory(key) {
  return COURSES.filter((c) => c.category === key);
}

export const COURSES = [
  {
    id: "ai-intro-special",
    category: "ai",
    level: "입문",
    title: "AI자동화 입문",
    subtitle: "비싼 사람들을 위한 값싼 AI 활용법",
    tagline: "김동찬 대표의 3시간 무료 특강",
    instructor: "김동찬 대표",
    lessons: 0,
    price: 0,
    free: true,
    summary:
      "AI를 어디서부터 써야 할지 막막한 분들을 위한 입문 무료 특강. 비용 들이지 않고 당장 업무에 적용하는 AI 활용법을 3시간에 압축했습니다.",
    highlights: [
      "무료 도구만으로 시작하는 AI 업무 자동화",
      "실무에 바로 쓰는 프롬프트 작성법",
      "문서·이메일·검색 시간을 절반으로 줄이는 루틴",
      "유료 도구로 넘어가야 할 시점 판단 기준",
    ],
    target: ["AI를 처음 써보는 분", "비용 부담 없이 시작하고 싶은 분", "실무 적용 사례가 궁금한 분"],
    curriculum: [
      { section: "1부 — 왜 지금 AI인가", items: ["AI가 바꾸는 일하는 방식", "비용 대비 효과가 큰 영역 찾기"] },
      { section: "2부 — 무료로 시작하기", items: ["대표 무료 도구 한 바퀴", "첫 자동화 만들어보기"] },
      { section: "3부 — 실무 적용", items: ["내 업무에 맞는 활용 시나리오", "Q&A"] },
    ],
  },
  {
    id: "home-2026",
    category: "wealth",
    level: "입문",
    title: "26년 내집마련 유료특강",
    subtitle: "투자N이 알려주는 2026년 내집마련 전략",
    tagline: "2026년, 지금 사도 될까?",
    instructor: "리바운드에듀",
    lessons: 0,
    price: 30000,
    summary:
      "금리·정책·공급이 동시에 흔들리는 2026년, 내집마련 타이밍과 전략을 데이터로 정리한 실전 특강.",
    highlights: [
      "2026년 시장 사이클 진단",
      "내집마련 자금 계획 세우는 법",
      "지역·평형 선택 기준",
      "대출·세금 체크포인트",
    ],
    target: ["올해 내집마련을 고민 중인 분", "첫 주택 구입 예정자", "타이밍이 헷갈리는 분"],
    curriculum: [
      { section: "시장 진단", items: ["2026 금리·정책·공급 흐름", "지금 사이클의 위치"] },
      { section: "실전 전략", items: ["자금 계획", "지역·매물 고르기", "대출·세금"] },
    ],
  },
  {
    id: "hostel-special",
    category: "realestate",
    level: "중급",
    title: "호스텔 창업 유료 특강",
    subtitle: "김동찬 대표의 호스텔 창업 A to Z",
    tagline: "100개+ 센터 오픈 노하우 압축",
    instructor: "김동찬 대표",
    lessons: 0,
    price: 150000,
    summary:
      "입지 선정부터 인허가, 인테리어, 운영, 수익화까지 호스텔 창업 전 과정을 한 번에 짚는 특강.",
    highlights: [
      "수익 나는 호스텔 입지 고르는 법",
      "인허가·소방·건축 핵심 체크",
      "초기 투자비와 손익분기 계산",
      "운영 자동화와 OTA 전략",
    ],
    target: ["호스텔·게스트하우스 창업 예정자", "숙박업 전환을 고민하는 건물주", "공간사업 투자자"],
    curriculum: [
      { section: "준비", items: ["시장과 입지", "인허가 절차"] },
      { section: "구축", items: ["인테리어와 비용", "초기 세팅"] },
      { section: "운영", items: ["OTA·예약 운영", "수익 관리"] },
    ],
  },
  {
    id: "corp-realestate",
    category: "wealth",
    level: "중급",
    title: "법인 활용 유료 특강",
    subtitle: "부동산 법인의 설립부터 절세까지",
    tagline: "개인 vs 법인, 무엇이 유리한가",
    instructor: "리바운드에듀",
    lessons: 0,
    price: 150000,
    summary:
      "부동산 투자에서 법인을 언제, 어떻게 활용해야 하는지 — 설립·운영·절세를 실전 사례로 정리.",
    highlights: [
      "개인과 법인의 세금 구조 비교",
      "법인 설립 절차와 비용",
      "법인 활용 절세 전략",
      "주의해야 할 규제와 함정",
    ],
    target: ["부동산 투자 규모를 키우는 분", "법인 전환을 고민하는 분", "절세 전략이 필요한 분"],
    curriculum: [
      { section: "기초", items: ["개인 vs 법인 비교", "법인 설립 실무"] },
      { section: "활용", items: ["취득·보유·양도 절세", "리스크 관리"] },
    ],
  },
  {
    id: "brokerage-intro",
    category: "realestate",
    level: "입문",
    title: "중개입문 수업",
    subtitle: "공인중개사 실무의 첫걸음",
    tagline: "시험 합격 후 무엇부터 해야 할까",
    instructor: "리바운드에듀",
    lessons: 0,
    price: 30000,
    summary:
      "자격증은 땄는데 실무가 막막한 신입 중개사를 위한 입문 수업. 개업·매물·고객 응대의 기본기를 잡습니다.",
    highlights: ["개업 준비 체크리스트", "매물 확보의 기본", "고객 응대 기초", "계약 흐름 이해"],
    target: ["합격 직후 신입 중개사", "개업 준비 중인 분", "실무가 막막한 분"],
    curriculum: [
      { section: "시작", items: ["개업 준비", "사무소 세팅"] },
      { section: "실무 기초", items: ["매물·고객", "계약 흐름"] },
    ],
  },
  {
    id: "brokerage-advanced",
    category: "realestate",
    level: "고급",
    title: "중개심화 수업",
    subtitle: "매출을 높이는 중개 실전 테크닉",
    tagline: "버티는 중개에서 이기는 중개로",
    instructor: "김동찬 대표",
    lessons: 0,
    price: 50000,
    summary:
      "매출이 정체된 중개사를 위한 심화 수업. 매물 소싱, 마케팅, 고객 전환을 실전 테크닉으로 끌어올립니다.",
    highlights: ["전속 매물 늘리는 법", "온라인 매물 마케팅", "고객 전환율 높이기", "객단가 올리는 협상"],
    target: ["매출 정체를 느끼는 중개사", "마케팅을 강화하고 싶은 분", "센터 운영자"],
    curriculum: [
      { section: "소싱", items: ["전속 매물 전략", "소유주 접근"] },
      { section: "전환", items: ["마케팅", "협상·클로징"] },
    ],
  },
  {
    id: "investment-dev-pro",
    category: "wealth",
    level: "고급",
    title: "부동산 투자개발 실전",
    subtitle: "소액 투자부터 개발사업까지",
    tagline: "현직 CEO의 투자개발 전 과정",
    instructor: "김동찬 대표",
    lessons: 30,
    price: 490000,
    originalPrice: 690000,
    discountPct: 29,
    summary:
      "소액 투자에서 개발사업까지, 부동산으로 자산을 키우는 실전 과정. 30강에 걸쳐 분석·자금·실행을 다룹니다.",
    highlights: [
      "투자 물건 분석 프레임워크",
      "자금 조달과 레버리지 설계",
      "개발사업 인허가와 사업성 검토",
      "출구 전략과 수익 실현",
    ],
    target: ["부동산 투자를 본격화하는 분", "개발사업에 관심 있는 분", "자산가·투자자"],
    curriculum: [
      { section: "분석", items: ["물건 분석", "시장·입지 평가", "사업성 검토"] },
      { section: "자금", items: ["자금 조달", "레버리지 설계", "리스크 관리"] },
      { section: "실행", items: ["인허가", "시공·운영", "출구 전략"] },
    ],
  },
  {
    id: "ai-system-design",
    category: "ai",
    level: "고급",
    title: "고연봉 AI 시스템 설계",
    subtitle: "AI 시대의 비즈니스 전략",
    tagline: "AI를 도구가 아닌 시스템으로",
    instructor: "김동찬 대표",
    lessons: 18,
    price: 290000,
    originalPrice: 590000,
    discountPct: 51,
    summary:
      "단순 활용을 넘어 AI를 비즈니스 시스템으로 설계하는 고급 과정. 자동화 아키텍처와 수익 모델을 함께 다룹니다.",
    highlights: [
      "업무 전체를 잇는 자동화 아키텍처",
      "에이전트·워크플로우 설계",
      "AI 기반 수익 모델",
      "팀에 AI를 도입하는 전략",
    ],
    target: ["AI로 사업을 키우려는 대표", "자동화를 설계하려는 실무자", "AI 도입 책임자"],
    curriculum: [
      { section: "설계", items: ["시스템 사고", "자동화 아키텍처", "에이전트 설계"] },
      { section: "비즈니스", items: ["수익 모델", "조직 도입", "운영·확장"] },
    ],
  },
  {
    id: "ai-automation-basic",
    category: "ai",
    level: "입문",
    title: "AI 업무 자동화 기초",
    subtitle: "ChatGPT부터 자동화 워크플로우까지",
    tagline: "오늘 배워 내일 쓰는 자동화",
    instructor: "리바운드에듀",
    lessons: 12,
    price: 190000,
    summary:
      "ChatGPT 활용부터 노코드 자동화까지, 실무 업무를 자동화하는 기초를 12강으로 정리한 과정.",
    highlights: ["ChatGPT 실무 활용", "노코드 자동화 도구", "반복 업무 자동화 워크플로우", "문서·데이터 처리 자동화"],
    target: ["AI 자동화 입문자", "반복 업무가 많은 직장인", "1인 사업자"],
    curriculum: [
      { section: "기초", items: ["ChatGPT 활용법", "프롬프트 기본"] },
      { section: "자동화", items: ["노코드 도구", "워크플로우 만들기", "실무 적용"] },
    ],
  },
  {
    id: "hostel-bible",
    category: "realestate",
    level: "중급",
    title: "호스텔 창업 바이블",
    subtitle: "숙박업 창업의 A to Z",
    tagline: "20강으로 끝내는 숙박업 창업",
    instructor: "김동찬 대표",
    lessons: 20,
    price: 390000,
    originalPrice: 490000,
    discountPct: 20,
    summary:
      "숙박업 창업의 전 과정을 20강에 담은 완성형 과정. 특강에서 다루지 못한 디테일까지 체계적으로 정리합니다.",
    highlights: ["입지·시장 분석 심화", "인허가·건축 실무", "인테리어·세팅 가이드", "운영 자동화와 수익 극대화"],
    target: ["숙박업 창업 예정자", "운영 중인 호스텔 점주", "공간사업 투자자"],
    curriculum: [
      { section: "준비", items: ["시장·입지", "사업 계획", "인허가"] },
      { section: "구축", items: ["건축·인테리어", "초기 세팅", "비용 관리"] },
      { section: "운영", items: ["OTA 운영", "수익 관리", "확장 전략"] },
    ],
  },
  {
    id: "brokerage-practice",
    category: "realestate",
    level: "입문",
    title: "부동산 중개 실무 입문",
    subtitle: "중개사 시험 합격부터 실무까지",
    tagline: "합격 그 다음, 실무로 가는 길",
    instructor: "리바운드에듀",
    lessons: 16,
    price: 290000,
    summary:
      "시험 합격 이후 실무에 안착하기까지 필요한 모든 것을 16강으로 정리한 입문 완성 과정.",
    highlights: ["개업·운영 실무", "매물·계약 전 과정", "고객 관리와 마케팅", "중개사고 예방"],
    target: ["신입·예비 중개사", "개업 준비자", "실무를 체계적으로 배우고 싶은 분"],
    curriculum: [
      { section: "개업", items: ["사무소 세팅", "운영 기초"] },
      { section: "실무", items: ["매물 관리", "계약 실무", "고객·마케팅"] },
      { section: "안전", items: ["중개사고 예방", "법규 체크"] },
    ],
  },
  {
    id: "vacancy-master",
    category: "realestate",
    level: "중급",
    title: "공실 해결 실전 마스터 과정",
    subtitle: "공실률 0%를 달성하는 실전 노하우",
    tagline: "비어 있는 공간을 수익으로",
    instructor: "김동찬 대표",
    lessons: 24,
    price: 390000,
    originalPrice: 490000,
    discountPct: 20,
    summary:
      "공실의 원인을 진단하고 해결하는 실전 마스터 과정. 임대·운영·전환 전략을 24강으로 다룹니다.",
    highlights: ["공실 원인 5요소 진단", "임차 유치 마케팅", "임대 조건·계약 설계", "용도 전환·리모델링 판단"],
    target: ["공실로 고민하는 건물주", "상가·사업장 임대인", "자산 관리 담당자"],
    curriculum: [
      { section: "진단", items: ["공실 원인 분석", "시장·임대료 점검"] },
      { section: "해결", items: ["임차 유치", "조건·계약 설계", "운영 개선"] },
      { section: "전환", items: ["용도 전환", "리모델링 ROI", "사례 분석"] },
    ],
  },
];

export function getCourse(id) {
  return COURSES.find((c) => c.id === id) || null;
}

export function formatPrice(won) {
  if (won === 0) return "무료";
  return "₩" + won.toLocaleString("ko-KR");
}
