import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseGrid from "@/components/CourseGrid";
import { COURSES } from "@/lib/courses";

export const metadata = {
  title: "강의 목록",
  description:
    "실전에서 바로 쓰는 강의만 모았습니다. 부동산 중개·숙박업·투자개발·AI 자동화·공실 해결.",
};

export default function CoursesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu pt-12 pb-2">
          <span className="text-[13px] font-bold uppercase tracking-widest text-brand">
            Courses
          </span>
          <h1 className="mt-2 text-[30px] font-black leading-tight text-ink sm:text-[36px]">
            수강 신청 가능 강의
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            실전에서 바로 쓰는 강의만 모았습니다. 부동산 중개, 숙박업, 투자개발, AI 자동화까지.
            원하는 강의를 선택하면 상세 페이지에서 Cafe24 안전결제로 이동합니다.
          </p>
        </section>

        <section className="container-edu py-9">
          <CourseGrid courses={COURSES} />
        </section>
      </main>
      <Footer />
    </>
  );
}
