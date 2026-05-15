import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | 리바운드에듀",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-xl font-extrabold text-brand">리바운드</span>
            <span className="text-xl font-extrabold text-gray-900">에듀</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">이용약관</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 주식회사 리바운드(이하 &quot;회사&quot;)가 운영하는 리바운드에듀 온라인 교육 플랫폼(이하 &quot;서비스&quot;)의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>&quot;서비스&quot;란 회사가 제공하는 온라인 교육 콘텐츠 및 관련 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 동의하고 서비스를 이용하는 고객(수강생) 및 전문가(강사)를 의미합니다.</li>
              <li>&quot;고객&quot;이란 서비스에서 강의를 수강하거나 전문가에게 서비스를 의뢰하는 이용자를 의미합니다.</li>
              <li>&quot;전문가&quot;란 서비스에서 강의를 등록하거나 전문 서비스를 제공하는 이용자를 의미합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 7일 전에 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제4조 (서비스의 제공)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>온라인 강의(VOD) 제공 및 수강 관리</li>
              <li>전문가와 고객 간 의뢰 연결 서비스</li>
              <li>수료증 발급 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제5조 (회원가입 및 계정)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>이용자는 Google 계정을 통해 회원가입할 수 있습니다.</li>
              <li>전문가 계정은 관리자 승인 후 활성화됩니다.</li>
              <li>이용자는 자신의 계정 정보를 정확하게 유지해야 하며, 허위 정보 입력 시 서비스 이용이 제한될 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제6조 (결제 및 환불)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>유료 강의의 결제는 신용카드, 간편결제 등 회사가 정한 결제 수단을 통해 이루어집니다.</li>
              <li>수강 시작 전(강의 영상 미재생) 시 결제일로부터 7일 이내 전액 환불이 가능합니다.</li>
              <li>수강 시작 후에는 진도율에 따라 부분 환불이 적용됩니다.</li>
              <li>환불 처리는 영업일 기준 3~5일이 소요됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제7조 (저작권)</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>서비스에서 제공되는 모든 강의 콘텐츠의 저작권은 해당 전문가 또는 회사에 귀속됩니다.</li>
              <li>이용자는 강의 콘텐츠를 개인 학습 목적으로만 사용할 수 있으며, 무단 복제·배포·전송을 금지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제8조 (면책)</h2>
            <p>
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              전문가와 고객 간 의뢰 거래에서 발생하는 분쟁에 대해 회사는 중개자로서의 역할만 수행하며, 거래 당사자 간 분쟁에 대한 직접적인 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제9조 (분쟁해결)</h2>
            <p>
              본 약관과 관련하여 발생하는 분쟁은 대한민국 법률에 따르며, 관할법원은 회사의 본점 소재지를 관할하는 법원으로 합니다.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3">회사 정보</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 space-y-1">
              <p>상호: 주식회사 리바운드</p>
              <p>대표자: 김동찬</p>
              <p>사업자등록번호: 234-86-03564</p>
              <p>통신판매업 신고번호: 제2025-서울중구-1637호</p>
              <p>법인등록번호: 110111-9085310</p>
              <p>주소: 서울특별시 중구 청파로103길 7</p>
              <p>대표전화: <a href="tel:02-2268-3382" className="text-brand hover:underline">02-2268-3382</a></p>
              <p>이메일: info@rebound.io.kr</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">시행일: 2026년 4월 12일</p>
          </section>
        </div>
      </main>
    </div>
  );
}
