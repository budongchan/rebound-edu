import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COURSES } from "@/lib/courses";

const FEATURED = COURSES.filter((c) => c.enrollCount > 0).slice(0, 3);

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-cream/30">
        <div className="container-edu max-w-2xl py-20 text-center">
          <p className="text-[64px] font-black leading-none text-ink/10">404</p>
          <h1 className="mt-4 text-[26px] font-black text-ink sm:text-[30px]">
            찾으시는 페이지가 없어요
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            주소가 바뀌었거나 강의가 마감되었을 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses"
              className="rounded-xl bg-brand px-6 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              전체 강의 보기
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-line bg-paper px-6 py-3 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              홈으로
            </Link>
          </div>

          {FEATURED.length > 0 && (
            <div className="mt-14 text-left">
              <p className="text-[13px] font-bold text-ink-soft/60">인기 강의</p>
              <div className="mt-3 space-y-3">
                {FEATURED.map((c) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-line bg-paper p-4 hover:border-ink/20"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-ink">{c.title}</p>
                      <p className="text-[12px] text-ink-soft">{c.subtitle}</p>
                    </div>
                    <span className="ml-4 shrink-0 text-[13px] font-black text-ink">
                      {c.price === 0 ? "무료" : `₩${c.price.toLocaleString("ko-KR")}`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
