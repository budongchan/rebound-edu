import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { MENU_CATEGORIES, getCategory, coursesByCategory } from "@/lib/courses";

export function generateStaticParams() {
  return MENU_CATEGORIES.map((c) => ({ key: c.key }));
}

export async function generateMetadata({ params }) {
  const { key } = await params;
  const cat = getCategory(key);
  if (!cat) return { title: "과목을 찾을 수 없습니다" };
  return { title: `${cat.label} 강의`, description: cat.intro };
}

export default async function SubjectPage({ params }) {
  const { key } = await params;
  const cat = getCategory(key);
  if (!cat || cat.key === "all") notFound();

  const courses = coursesByCategory(key);

  return (
    <>
      <Header />
      <main className="bg-cream/40">
        {/* 과목 히어로 */}
        <section className="text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}>
          <div className="container-edu py-14">
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-white/70">
              {MENU_CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  href={`/subjects/${c.key}`}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    c.key === key ? "bg-white text-ink" : "bg-white/15 hover:bg-white/25"
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
            <h1 className="mt-5 text-[32px] font-black sm:text-[42px]">{cat.label}</h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/85">{cat.intro}</p>
            <div className="mt-4 text-[14px] text-white/75">
              {courses.length > 0 ? `총 ${courses.length}개 강의` : "강의 준비 중"}
            </div>
          </div>
        </section>

        {/* 강의 목록 */}
        <section className="container-edu py-12">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-paper py-20 text-center">
              <h2 className="text-[20px] font-extrabold text-ink">곧 공개됩니다</h2>
              <p className="mt-2 text-[14px] text-ink-soft">
                {cat.label} 강의를 준비하고 있습니다. 가장 먼저 소식을 받아보세요.
              </p>
              <Link href="/courses" className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-[14px] font-bold text-white">
                다른 강의 둘러보기
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
