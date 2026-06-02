import LegalShell, { Article } from "@/components/LegalShell";

export const metadata = { title: "환불정책" };

export default function RefundPage() {
  return (
    <LegalShell title="환불정책" updated="2026년 6월 2일">
      <Article heading="1. 환불 원칙">
        <p>
          회사는 「콘텐츠산업진흥법」 및 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 따라
          환불을 처리합니다.
        </p>
      </Article>
      <Article heading="2. 환불 기준">
        <p>수강 시작(콘텐츠 최초 열람) 전: 전액 환불.</p>
        <p>수강 시작 후: 이용 기간·진도율 등에 따라 관련 법령 기준으로 산정하여 환불.</p>
        <p>무료 강의 및 무료 특강은 환불 대상에서 제외됩니다.</p>
      </Article>
      <Article heading="3. 환불 신청 방법">
        <p>고객센터(이메일·전화)로 환불을 신청하면 영업일 기준 3~7일 이내 처리됩니다.</p>
      </Article>
      <Article heading="4. 환불 제한">
        <p>이용자의 단순 변심이라도 콘텐츠를 상당 부분 이용한 경우 환불이 제한될 수 있습니다.</p>
      </Article>
    </LegalShell>
  );
}
