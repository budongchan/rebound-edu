import LegalShell, { Article } from "@/components/LegalShell";

export const metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <LegalShell title="이용약관" updated="2026년 6월 2일">
      <Article heading="제1조 (목적)">
        <p>
          본 약관은 주식회사 리바운드(이하 “회사”)가 운영하는 리바운드에듀(이하 “서비스”)의 이용과 관련하여
          회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Article>
      <Article heading="제2조 (정의)">
        <p>“강의”란 회사 또는 등록 전문가가 서비스를 통해 제공하는 온라인 교육 콘텐츠를 말합니다.</p>
        <p>“이용자”란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
      </Article>
      <Article heading="제3조 (결제 및 수강)">
        <p>유료 강의의 결제는 Cafe24 안전결제 등 회사가 제공하는 결제수단을 통해 이루어집니다.</p>
        <p>결제 완료 후 이용자는 해당 강의의 수강 권한을 부여받습니다.</p>
      </Article>
      <Article heading="제4조 (환불)">
        <p>환불에 관한 사항은 별도의 환불정책에 따릅니다.</p>
      </Article>
      <Article heading="제5조 (회사의 의무)">
        <p>회사는 관련 법령과 본 약관에 따라 안정적으로 서비스를 제공하기 위해 노력합니다.</p>
      </Article>
    </LegalShell>
  );
}
