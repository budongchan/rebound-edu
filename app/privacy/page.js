import LegalShell, { Article } from "@/components/LegalShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침" updated="2026년 6월 2일">
      <Article heading="1. 수집하는 개인정보 항목">
        <p>회사는 강의 결제 및 수강 안내를 위해 다음 정보를 수집합니다: 이름, 이메일, 연락처, 결제 정보.</p>
      </Article>
      <Article heading="2. 개인정보의 이용 목적">
        <p>강의 제공, 결제 처리, 수강 안내 및 영수증 발송, 고객 문의 응대를 위해 이용합니다.</p>
      </Article>
      <Article heading="3. 개인정보의 보유 및 이용 기간">
        <p>관련 법령에 따른 보존 기간을 준수하며, 목적 달성 후 지체 없이 파기합니다.</p>
      </Article>
      <Article heading="4. 개인정보 보호책임자">
        <p>책임자: {COMPANY.privacyOfficer} / 이메일: {COMPANY.email}</p>
      </Article>
      <Article heading="5. 이용자의 권리">
        <p>이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다.</p>
      </Article>
    </LegalShell>
  );
}
