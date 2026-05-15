import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금 안내 | 리바운드에듀",
  description: "리바운드에듀 수강료 안내 — 단건 수강부터 멤버십까지",
};

const PLANS = [
  {
    name: "단건 수강",
    desc: "관심 있는 강의만",
    price: "강의별 상이",
    priceNote: "29,000원 ~ 490,000원",
    features: [
      "원하는 강의 1건 결제",
      "평생 소장 (강의당 12개월)",
      "Q&A 질문 무제한",
      "수료증 발급",
    ],
  },
  {
    name: "프리미엄 멤버십",
    desc: "전체 강의 무제한",
    price: "99,000",
    priceNote: "원 / 월 (부가세 별도)",
    popular: true,
    features: [
      "전체 강의 무제한 수강",
      "신규 강의 즉시 이용",
      "전문가 의뢰 연결 우선권",
      "부동찬TV 멤버십 혜택",
      "우선 Q&A 답변",
    ],
  },
  {
    name: "연간 멤버십",
    desc: "20% 할인 혜택",
    price: "950,400",
    priceNote: "원 / 년 (월 79,200원)",
    features: [
      "프리미엄 멤버십 전체 포함",
      "연간 일괄 결제",
      "연 2회 오프라인 세미나 초청",
      "1:1 사업 상담 1회",
      "전담 매니저 배정",
    ],
  },
];

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-200">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center shadow-sm mr-1.5">
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="text-lg font-extrabold text-brand">리바운드</span>
          <span className="text-lg font-extrabold text-gray-900">에듀</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-gray-700 hover:text-brand transition-colors font-medium"
        >
          로그인
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto w-full px-6 pt-20 pb-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold mb-6">
          요금 안내
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          부동산·공간사업 전문 교육,
          <br />
          가장 합리적인 가격으로
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          단건 수강부터 멤버십까지, 필요한 플랜을 선택하세요.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto w-full px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 border transition-all ${
                plan.popular ? "border-brand shadow-xl" : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand text-white text-[10px] font-bold rounded-full">
                  인기
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
              <div className="mb-2">
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">{plan.priceNote}</p>
              <ul className="space-y-2.5 my-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-brand mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-brand text-white hover:bg-brand/90"
                    : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                로그인 후 결제
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="max-w-3xl mx-auto w-full px-6 pb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">결제 및 환불 안내</h2>
          <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
            <li>· 모든 요금은 부가세 별도입니다.</li>
            <li>· 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</li>
            <li>· 멤버십은 결제일 기준 자동 갱신되며 언제든 해지 가능합니다.</li>
            <li>· 환불 및 해지는 <Link href="/refund" className="underline hover:text-brand">환불 정책</Link>에 따라 처리됩니다.</li>
            <li>· 자세한 이용 조건은 <Link href="/terms" className="underline hover:text-brand">이용약관</Link>을 확인해 주세요.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="text-[11px] text-gray-500 leading-relaxed space-y-1">
            <p>상호: 주식회사 리바운드 | 대표: 김동찬 | 사업자등록번호: 234-86-03564 | 통신판매업신고번호: 제2025-서울중구-1637호</p>
            <p>주소: 서울특별시 중구 청파로103길 7 | 대표전화: <a href="tel:02-2268-3382" className="hover:text-brand">02-2268-3382</a> | 이메일: info@rebound.io.kr</p>
          </div>
          <p className="text-[11px] text-gray-300 mt-4">
            &copy; 2026 주식회사 리바운드. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
