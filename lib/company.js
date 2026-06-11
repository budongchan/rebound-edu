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

const missingBankValue = "계좌번호 확인 중";

// 무통장입금(계좌이체) 입금 계좌.
// 운영 시 Vercel env로 주입: NEXT_PUBLIC_BANK_NAME / _BANK_ACCOUNT / _BANK_HOLDER.
export const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || "우리은행",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || missingBankValue,
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "주식회사 리바운드",
  // 입금 기한(시간). 주문 후 이 시간 내 미입금 시 자동 취소 안내.
  deadlineHours: 24,
};

export function isBankTransferReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_BANK_NAME &&
    process.env.NEXT_PUBLIC_BANK_ACCOUNT &&
    process.env.NEXT_PUBLIC_BANK_HOLDER &&
    BANK.account !== missingBankValue
  );
}
