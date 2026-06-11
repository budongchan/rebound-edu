// 회사 법정 정보 — 라이브 사이트(edu.rebound.io.kr) 푸터 기준.
// 통신판매업 신고번호 등은 운영 시 env(NEXT_PUBLIC_*)로 분리 권장.
export const COMPANY = {
  serviceName: "리바운드에듀",
  legalName: "주식회사 리바운드",
  representative: "김동찬",
  bizNo: "234-86-03564",
  ecommerceNo: "제2025-서울중구-1637호",
  address: "서울특별시 중구 청파로103길 7(중림동, 원빌딩)",
  phone: "02-2268-3382",
  email: "info@rebound.io.kr",
  privacyOfficer: "김동찬",
  hostingProvider: "Vercel Inc.",
};

// 무통장입금(계좌이체) 입금 계좌.
// 리바운드공유오피스와 동일 계좌를 기본값으로 사용하며, 운영 env로 재정의 가능.
export const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || "우리은행",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "1005-104-859768",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "주식회사 리바운드",
  // 입금 기한(시간). 주문 후 이 시간 내 미입금 시 자동 취소 안내.
  deadlineHours: 24,
};
