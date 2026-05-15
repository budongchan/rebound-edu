import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "환불 정책 | 리바운드에듀",
  description: "리바운드에듀 수강료 환불 및 취소 정책 안내",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center shadow-sm mr-1.5">
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="text-lg font-extrabold text-brand">리바운드</span>
          <span className="text-lg font-extrabold text-gray-900">에듀</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">환불 정책</h1>
        <p className="text-sm text-gray-500 mb-10">시행일: 2026년 4월 12일</p>

        <div className="space-y-10 text-gray-800 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">1. 기본 원칙</h2>
            <p>
              주식회사 리바운드(이하 &ldquo;회사&rdquo;)는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「학원의 설립·운영 및 과외교습에 관한 법률」에 따라
              이용자의 환불 권리를 보장합니다. 본 환불 정책은 리바운드에듀 강의 상품과 멤버십 상품에 적용됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">2. 단건 수강 환불 규정</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>수강 시작 전: 결제금액의 <strong>100%</strong> 환불</li>
              <li>수강 진행률 1/3 이하: 결제금액의 <strong>2/3</strong> 환불</li>
              <li>수강 진행률 1/2 이하: 결제금액의 <strong>1/2</strong> 환불</li>
              <li>수강 진행률 1/2 초과: <strong>환불 불가</strong></li>
              <li>무료 과정은 환불 대상에 해당하지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">3. 멤버십 환불 규정</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>결제일로부터 7일 이내, 멤버십 콘텐츠를 실질적으로 이용하지 않은 경우 전액 환불합니다.</li>
              <li>이미 강의를 수강하거나 유료 기능을 사용한 경우 청약 철회가 제한됩니다.</li>
              <li>멤버십은 언제든 해지 가능하며, 해지 시 다음 결제일부터 과금이 중단됩니다.</li>
              <li>월 중도 해지 시 일할 환불은 원칙적으로 제공하지 않습니다.</li>
              <li>연간 멤버십의 경우, 이용 개월 수에 대한 월 정상가(99,000원)를 차감한 후 잔액을 환불합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">4. 회사의 귀책에 의한 환불</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>회사의 귀책사유(서비스 장애, 강의 중단 등)로 서비스를 이용하지 못한 경우, 해당 기간에 대해 전액 환불합니다.</li>
              <li>서비스가 영구 중단되는 경우, 잔여 이용 기간에 해당하는 금액을 전액 환불합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">5. 환불 신청 및 처리</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>환불 신청은 이메일(info@rebound.io.kr) 또는 대표전화(02-2268-3382)로 접수합니다.</li>
              <li>접수 후 영업일 기준 7일 이내에 처리됩니다.</li>
              <li>카드 결제의 경우 카드사 정책에 따라 실제 반영까지 7~14일이 소요될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-brand">6. 기타</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>본 환불 정책에 명시되지 않은 사항은 <Link href="/terms" className="text-brand underline">이용약관</Link> 및 관련 법령에 따릅니다.</li>
            </ul>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold mb-3 text-brand">환불 문의</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-1">
              <p>상호: 주식회사 리바운드</p>
              <p>대표자: 김동찬</p>
              <p>사업자등록번호: 234-86-03564</p>
              <p>통신판매업 신고번호: 제2025-서울중구-1637호</p>
              <p>주소: 서울특별시 중구 청파로103길 7</p>
              <p>대표전화: <a href="tel:02-2268-3382" className="text-brand hover:underline">02-2268-3382</a></p>
              <p>이메일: info@rebound.io.kr</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        &copy; 2026 주식회사 리바운드. All rights reserved.
      </footer>
    </div>
  );
}
