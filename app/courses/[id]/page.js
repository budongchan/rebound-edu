import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  COURSES,
  getCourse,
  formatPrice,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
} from "@/lib/courses";
import { getInstructor } from "@/lib/instructors";

export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) return { title: "강의를 찾을 수 없습니다" };
  return {
    title: course.title,
    description: course.summary,
  };
}

export default async function CourseDetail({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) notFound();

  const color = CATEGORY_COLOR[course.category] || "#14110f";
  const totalLessons = course.curriculum.reduce((n, s) => n + s.items.length, 0);
  const instructor = getInstructor(course.instructor);

  const WEEKDAY_KO = { 월: "월요일", 화: "화요일", 수: "수요일", 목: "목요일", 금: "금요일", 토: "토요일" };
  const DELIVERY_ICON = { 오프라인: "📍", 온라인: "💻" };

  return (
    <>
      <Header />
      <main className="bg-cream/40">
        {/* HERO */}
        <section className="text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <div className="container-edu py-14">
            <Link href="/courses" className="text-[13px] font-semibold text-white/70 hover:text-white">
              ← 강의 목록
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold">
                {CATEGORY_LABEL[course.category]}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold">
                {course.level}
              </span>
              {course.live && (
                <span className="rounded-full bg-white px-3 py-1 text-[12px] font-black" style={{ color }}>
                  개강
                </span>
              )}
              {course.guarantee && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-black text-ink">
                  {course.guarantee}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-[30px] font-black leading-tight sm:text-[40px]">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/85">
              {course.subtitle}
            </p>

            {/* 일정·방식 인포 */}
            {course.schedule && (
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white">
                  <span>🗓</span>
                  {course.schedule}
                </div>
                {course.delivery && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white">
                    <span>{DELIVERY_ICON[course.delivery] || "📌"}</span>
                    {course.delivery}
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white">
                    <span>⏱</span>
                    {course.duration}
                  </div>
                )}
              </div>
            )}

            {!course.schedule && (
              <div className="mt-5 text-[13px] text-white/70">
                {course.instructor} · 총 {course.lessons}강
              </div>
            )}

            {/* 보너스 */}
            {course.bonus && course.bonus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {course.bonus.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[12px] text-white/90">
                    <span>+</span>
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* BODY */}
        <section className="container-edu grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">강의 소개</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{course.summary}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">이런 걸 배웁니다</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-white">
                      ✓
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">이런 분께 추천합니다</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {course.target.map((t, i) => (
                  <span key={i} className="rounded-full bg-cream px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-paper p-7">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[20px] font-extrabold text-ink">커리큘럼</h2>
                <span className="text-[13px] text-ink-soft">{course.curriculum.length}개 섹션 · {totalLessons}개 주제</span>
              </div>
              <div className="mt-4 space-y-4">
                {course.curriculum.map((sec, i) => (
                  <div key={i} className="rounded-xl border border-line">
                    <div className="border-b border-line bg-cream/60 px-4 py-3 text-[14px] font-bold text-ink">
                      {sec.section}
                    </div>
                    <ul className="divide-y divide-line">
                      {sec.items.map((it, j) => (
                        <li key={j} className="flex items-center gap-3 px-4 py-3 text-[14px] text-ink-soft">
                          <span className="text-[12px] font-bold text-brand/60">{String(j + 1).padStart(2, "0")}</span>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {course.lessons === 0 && (
                <p className="mt-4 text-[13px] text-ink-soft/80">
                  * 본 과정은 라이브/특강 형태로 진행되며, 세부 커리큘럼은 신청 후 안내됩니다.
                </p>
              )}
            </div>

            {/* 수강 후 달라지는 것 */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="mt-6 rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">수강 후 달라지는 것</h2>
                <ul className="mt-4 space-y-3">
                  {course.outcomes.map((o, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 강사 프로필 */}
            {instructor && (
              <div className="mt-6 rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">강사 소개</h2>
                <div className="mt-5 flex gap-5">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[22px] font-black text-white"
                    style={{ background: instructor.color || color }}
                  >
                    {instructor.initial || instructor.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[16px] font-extrabold text-ink">{instructor.name}</p>
                    <p className="mt-0.5 text-[13px] text-ink-soft">{instructor.title}</p>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{instructor.bio}</p>
                    {instructor.credentials && (
                      <ul className="mt-3 space-y-1.5">
                        {instructor.credentials.map((cred, i) => (
                          <li key={i} className="flex gap-2 text-[13px] text-ink-soft">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
                            {cred}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STICKY PURCHASE */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-[0_18px_40px_-26px_rgba(20,17,15,0.4)]">
              {course.guarantee && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-bold text-green-700">
                  <span>✅</span>
                  {course.guarantee}
                </div>
              )}

              {course.discountPct ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand px-2 py-0.5 text-[12px] font-black text-white">
                    {course.discountPct}%
                  </span>
                  <span className="text-[14px] text-ink-soft line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                </div>
              ) : null}

              {course.priceLabel ? (
                <div className="mt-1">
                  <div className="text-[22px] font-black text-ink">{course.priceLabel}</div>
                </div>
              ) : (
                <div className="mt-1 text-[28px] font-black text-ink">{formatPrice(course.price)}</div>
              )}

              <Link
                href={`/checkout/${course.id}`}
                className="mt-5 block rounded-xl bg-brand px-5 py-3.5 text-center text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                {course.free ? "무료 신청하기" : course.enrollAlways ? "상시 신청하기" : "결제하기"}
              </Link>
              <p className="mt-3 text-center text-[12px] text-ink-soft/80">
                {course.free ? "로그인 후 바로 신청됩니다." : "신청 후 입금 계좌가 안내됩니다. (무통장입금)"}
              </p>

              <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[13px]">
                <div className="flex justify-between"><dt className="text-ink-soft">분야</dt><dd className="font-semibold text-ink">{CATEGORY_LABEL[course.category]}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">난이도</dt><dd className="font-semibold text-ink">{course.level}</dd></div>
                {course.schedule && (
                  <div className="flex justify-between"><dt className="text-ink-soft">일정</dt><dd className="text-right font-semibold text-ink" style={{ maxWidth: "200px" }}>{course.scheduleShort || course.schedule}</dd></div>
                )}
                {course.delivery && (
                  <div className="flex justify-between"><dt className="text-ink-soft">방식</dt><dd className="font-semibold text-ink">{course.delivery}</dd></div>
                )}
                {course.format && (
                  <div className="flex justify-between"><dt className="text-ink-soft">포맷</dt><dd className="font-semibold text-ink">{course.format}</dd></div>
                )}
                {course.duration && (
                  <div className="flex justify-between"><dt className="text-ink-soft">시간</dt><dd className="font-semibold text-ink">{course.duration}</dd></div>
                )}
                {!course.schedule && course.lessons > 0 && (
                  <div className="flex justify-between"><dt className="text-ink-soft">강의 수</dt><dd className="font-semibold text-ink">총 {course.lessons}강</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-ink-soft">강사</dt><dd className="font-semibold text-ink">{course.instructor}</dd></div>
              </dl>

              {course.bonus && course.bonus.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[12px] font-bold text-ink-soft">수강 혜택</p>
                  <ul className="mt-2 space-y-1.5">
                    {course.bonus.map((b, i) => (
                      <li key={i} className="flex gap-1.5 text-[12px] text-ink-soft">
                        <span className="shrink-0 text-brand">+</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
