import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 리바운드에듀",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 text-sm text-gray-600 leading-relaxed">
          <p>
            주식회사 리바운드(이하 &quot;회사&quot;)는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고,
            이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">필수 항목</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                  <li>이름, 이메일 주소, 연락처(휴대전화번호)</li>
                  <li>Google 계정 정보 (이름, 이메일, 프로필 이미지)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">선택 항목</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                  <li>관심 분야, 프로필 사진</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">자동 수집 항목</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                  <li>IP 주소, 쿠키, 접속 기록, 서비스 이용 기록, 기기 정보</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. 개인정보의 수집·이용 목적</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 가입 및 본인 확인</li>
              <li>서비스 제공 및 수강 관리</li>
              <li>강의 결제 및 환불 처리</li>
              <li>고객 상담 및 공지사항 전달</li>
              <li>수료증 발급</li>
              <li>서비스 개선을 위한 통계 분석</li>
              <li>마케팅 정보 제공 (동의자에 한함)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지)</li>
              <li>전자상거래법에 따른 계약·결제 기록: 5년</li>
              <li>소비자 불만 또는 분쟁 처리 기록: 3년</li>
              <li>접속 기록: 3개월</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              단, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의한 경우</li>
              <li>결제 처리를 위해 PG사에 제공하는 경우 (최소한의 정보만 제공)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. 개인정보의 파기</h2>
            <p>
              수집 목적이 달성되거나 보유 기간이 경과한 개인정보는 지체 없이 파기합니다.
              전자적 파일 형태의 정보는 복구할 수 없는 방법으로 삭제하며,
              종이에 출력된 개인정보는 분쇄하거나 소각하여 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. 이용자의 권리</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>개인정보 열람, 정정, 삭제, 처리정지를 요구할 권리가 있습니다.</li>
              <li>회원 탈퇴를 통해 개인정보 처리에 대한 동의를 철회할 수 있습니다.</li>
              <li>만 14세 미만 아동의 개인정보는 수집하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. 쿠키의 사용</h2>
            <p>
              회사는 이용자에게 최적화된 서비스를 제공하기 위해 쿠키를 사용합니다.
              이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
              이 경우 서비스 이용에 일부 제한이 발생할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-1">
              <p><strong>성명:</strong> 김동찬</p>
              <p><strong>직위:</strong> 대표이사</p>
              <p><strong>상호:</strong> 주식회사 리바운드</p>
              <p><strong>사업자등록번호:</strong> 234-86-03564</p>
              <p><strong>주소:</strong> 서울특별시 중구 청파로103길 7</p>
              <p><strong>대표전화:</strong> <a href="tel:02-2268-3382" className="text-brand hover:underline">02-2268-3382</a></p>
              <p><strong>이메일:</strong> info@rebound.io.kr</p>
            </div>
          </section>

          <section className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">시행일: 2026년 4월 12일</p>
          </section>
        </div>
      </main>
    </div>
  );
}
