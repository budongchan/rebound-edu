import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "강의 목록 | 리바운드에듀",
  description: "리바운드에듀에서 현재 수강 신청 가능한 부동산·공간사업·AI 자동화 강의를 확인하세요.",
};

interface PublicCourse {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  price: number;
  discount_price: number | null;
  category: string;
  difficulty: string | null;
  total_lectures: number | null;
  total_duration_sec: number | null;
  thumbnail_url: string | null;
  instructor: { name: string } | { name: string }[] | null;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "고급",
};

const GRADIENT_COLORS: Record<string, string> = {
  vacancy: "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  brokerage: "linear-gradient(135deg,#228be6,#4dabf7)",
  hostel: "linear-gradient(135deg,#40c057,#69db7c)",
  ai_automation: "linear-gradient(135deg,#7950f2,#9775fa)",
  investment: "linear-gradient(135deg,#fd7e14,#ffa94d)",
  other: "linear-gradient(135deg,#868e96,#adb5bd)",
};

function getInstructorName(instructor: PublicCourse["instructor"]) {
  if (Array.isArray(instructor)) return instructor[0]?.name || "리바운드에듀";
  return instructor?.name || "리바운드에듀";
}

function getDisplayPrice(course: PublicCourse) {
  return course.discount_price ?? course.price ?? 0;
}

export default async function PublicCoursesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id, slug, title, subtitle, price, discount_price, category, difficulty,
      total_lectures, total_duration_sec, thumbnail_url,
      instructor:users!courses_instructor_id_fkey(name)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const courses = (data || []) as PublicCourse[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-xl font-extrabold text-brand">리바운드</span>
            <span className="text-xl font-extrabold text-gray-900">에듀</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-bold text-brand hover:text-brand-dark">
            로그인
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto w-full px-6 py-12 flex-1">
        <section className="mb-10">
          <div className="inline-flex items-center rounded-full bg-brand/10 border border-brand/20 text-brand px-4 py-1.5 text-xs font-bold mb-5">
            수강 신청 가능 강의
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            실전에서 바로 쓰는 강의만 모았습니다
          </h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            부동산 중개, 숙박업, 투자개발, AI 자동화까지. 원하는 강의를 선택하고 로그인 후 수강 신청을 남기면 운영팀이 결제·수강 절차를 안내합니다.
          </p>
        </section>

        {error ? (
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
            <p className="font-bold text-gray-900 mb-2">강의 목록을 불러오지 못했습니다.</p>
            <p className="text-sm text-gray-500">잠시 후 다시 확인해 주세요.</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">현재 공개된 강의가 없습니다.</p>
            <p className="text-sm text-gray-500">곧 새로운 강의가 등록됩니다.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const displayPrice = getDisplayPrice(course);
              const discountPct = course.discount_price
                ? Math.round((1 - course.discount_price / course.price) * 100)
                : 0;
              const href = `/courses/${course.slug || course.id}`;

              return (
                <Link
                  key={course.id}
                  href={href}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand/30 hover:shadow-xl transition-all"
                >
                  <div
                    className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: course.thumbnail_url
                        ? `url(${course.thumbnail_url}) center/cover`
                        : GRADIENT_COLORS[course.category] || GRADIENT_COLORS.other,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                    {!course.thumbnail_url && (
                      <span className="relative text-white/90 text-sm font-bold">
                        {CATEGORY_LABELS[course.category] || "강의"}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-full">
                        {CATEGORY_LABELS[course.category] || course.category}
                      </span>
                      {course.difficulty && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2">
                      {course.title}
                    </h2>
                    {course.subtitle && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-400 mb-4">
                      {getInstructorName(course.instructor)} · 총 {course.total_lectures || 0}강
                    </p>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        {course.discount_price && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-red-500">{discountPct}%</span>
                            <span className="text-xs text-gray-400 line-through">₩{formatPrice(course.price)}</span>
                          </div>
                        )}
                        <p className="text-xl font-black text-gray-900">
                          {displayPrice === 0 ? "무료" : `₩${formatPrice(displayPrice)}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-white bg-brand rounded-lg px-3 py-2 group-hover:bg-brand-dark transition">
                        신청하기
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-8 text-[11px] text-gray-500 leading-relaxed">
          <p>상호: 주식회사 리바운드 | 대표: 김동찬 | 사업자등록번호: 234-86-03564 | 통신판매업신고번호: 제2025-서울중구-1637호</p>
          <p>대표전화: 02-2268-3382 | 이메일: info@rebound.io.kr</p>
        </div>
      </footer>
    </div>
  );
}
