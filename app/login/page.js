import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center bg-cream/40 px-5 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">
            R
          </span>
          <h1 className="mt-5 text-[20px] font-extrabold text-ink">리바운드에듀 로그인</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Google 간편 로그인을 준비 중입니다.<br />지금은 로그인 없이 강의 결제가 가능합니다.
          </p>

          <button
            disabled
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-cream/60 px-5 py-3 text-[14px] font-bold text-ink-soft"
          >
            <span className="text-[15px]">G</span> Google로 계속하기 (준비 중)
          </button>

          <Link
            href="/courses"
            className="mt-3 block w-full rounded-xl bg-ink px-5 py-3 text-[14px] font-bold text-white"
          >
            강의 둘러보기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
