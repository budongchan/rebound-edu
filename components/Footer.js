import Link from "next/link";
import { COMPANY } from "@/lib/company";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-edu py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-black text-white">
                R
              </span>
              <span className="text-[15px] font-extrabold text-ink">
                리바운드 <span className="text-brand">에듀</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-soft">
              현장 전문가가 직접 가르치는 부동산·공간사업 실전 교육 플랫폼.
            </p>
          </div>
          <nav className="flex gap-10 text-[13px]">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-ink">서비스</span>
              <Link href="/courses" className="text-ink-soft hover:text-ink">강의 목록</Link>
              <Link href="/#faq" className="text-ink-soft hover:text-ink">자주 묻는 질문</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-bold text-ink">정책</span>
              <Link href="/terms" className="text-ink-soft hover:text-ink">이용약관</Link>
              <Link href="/privacy" className="text-ink-soft hover:text-ink">개인정보처리방침</Link>
              <Link href="/refund" className="text-ink-soft hover:text-ink">환불정책</Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-[12px] leading-relaxed text-ink-soft">
          상호: {COMPANY.legalName} &nbsp;|&nbsp; 대표: {COMPANY.representative} &nbsp;|&nbsp;
          사업자등록번호: {COMPANY.bizNo} &nbsp;|&nbsp; 통신판매업신고번호: {COMPANY.ecommerceNo}
          <br />
          주소: {COMPANY.address}
          <br />
          대표전화: {COMPANY.phone} &nbsp;|&nbsp; 이메일: {COMPANY.email} &nbsp;|&nbsp;
          호스팅서비스 제공자: {COMPANY.hostingProvider}
          <div className="mt-2 text-ink-soft/70">
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
