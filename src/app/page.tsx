"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_LABELS } from "@/types";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ChannelTalk from "@/components/ui/ChannelTalk";

interface LandingCourse {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  total_lectures: number;
  instructorName: string;
  avgRating: number;
  reviewCount: number;
}

const GRADIENT_COLORS: Record<string, string> = {
  vacancy: "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  brokerage: "linear-gradient(135deg,#228be6,#4dabf7)",
  hostel: "linear-gradient(135deg,#40c057,#69db7c)",
  ai_automation: "linear-gradient(135deg,#7950f2,#9775fa)",
  investment: "linear-gradient(135deg,#fd7e14,#ffa94d)",
  other: "linear-gradient(135deg,#868e96,#adb5bd)",
};

export default function HomePage() {
  const [courses, setCourses] = useState<LandingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: coursesData } = await supabase
        .from("courses")
        .select(`
          id, title, price, discount_price, category, total_lectures,
          instructor:users!courses_instructor_id_fkey(name)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!coursesData) { setLoading(false); return; }

      // Reviews
      const courseIds = coursesData.map((c) => c.id);
      const { data: reviews } = courseIds.length > 0
        ? await supabase.from("reviews").select("course_id, rating").in("course_id", courseIds)
        : { data: [] };

      const reviewMap: Record<string, { sum: number; count: number }> = {};
      reviews?.forEach((r) => {
        if (!reviewMap[r.course_id]) reviewMap[r.course_id] = { sum: 0, count: 0 };
        reviewMap[r.course_id].sum += r.rating;
        reviewMap[r.course_id].count += 1;
      });

      setCourses(coursesData.map((c) => {
        const rawInst = c.instructor as { name: string } | { name: string }[] | null;
        const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
        return {
          id: c.id,
          title: c.title,
          price: c.price,
          discount_price: c.discount_price,
          category: c.category,
          total_lectures: c.total_lectures,
          instructorName: inst?.name || "강사",
          avgRating: reviewMap[c.id] ? reviewMap[c.id].sum / reviewMap[c.id].count : 0,
          reviewCount: reviewMap[c.id]?.count || 0,
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = category === "all" ? courses : courses.filter((c) => c.category === category);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-xl font-extrabold text-brand">리바운드</span>
            <span className="text-xl font-extrabold text-gray-900">에듀</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm text-white bg-brand px-5 py-2 rounded-lg font-semibold hover:bg-brand-dark transition"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-light to-white py-16 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-sm font-semibold text-brand mb-4">
            부동산·공간사업 전문 교육 플랫폼
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            공실을 기회로 바꾸는
            <br />
            <span className="text-brand">실전 교육</span>의 시작
          </h1>
          <p className="text-base text-gray-500 leading-relaxed mb-8">
            현장 전문가의 노하우를 온라인으로 배워보세요
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-brand text-white px-8 py-3 rounded-lg text-[15px] font-semibold hover:bg-brand-dark transition"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1200px] mx-auto px-6 pt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">인기 강의</h2>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`text-sm px-5 py-2 rounded-full font-medium transition ${
                category === cat.value
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-[1200px] mx-auto px-6 py-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">강의가 없습니다</p>
            <p className="text-sm">다른 카테고리를 선택해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
            {filtered.map((course) => (
              <Link
                key={course.id}
                href={`/student/explore/${course.id}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="h-[140px] flex items-center justify-center"
                  style={{
                    background: GRADIENT_COLORS[course.category] || GRADIENT_COLORS.other,
                  }}
                >
                  <span className="text-white/80 text-sm font-medium">
                    {CATEGORY_LABELS[course.category] || "기타"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex gap-1 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {course.instructorName} · 총 {course.total_lectures}강
                  </p>
                  {course.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i <= Math.floor(course.avgRating) ? "#FFB800" : "none"}
                          stroke="#FFB800"
                          strokeWidth={2}
                        />
                      ))}
                      <span className="text-[11px] text-gray-400 ml-1">
                        ({course.reviewCount})
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    {course.discount_price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₩{formatPrice(course.price)}
                      </span>
                    )}
                    <span className="text-[15px] font-bold text-gray-900">
                      ₩{formatPrice(course.discount_price || course.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-brand">{courses.length}+</p>
              <p className="text-sm text-gray-500 mt-1">전문 강의</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">
                {courses.reduce((s, c) => s + c.total_lectures, 0)}+
              </p>
              <p className="text-sm text-gray-500 mt-1">총 강의 차시</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">5</p>
              <p className="text-sm text-gray-500 mt-1">전문 카테고리</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">현장</p>
              <p className="text-sm text-gray-500 mt-1">전문가 직강</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
          지금 바로 시작하세요
        </h2>
        <p className="text-base text-gray-500 mb-6">
          부동산·공간사업 전문가로의 첫걸음, 리바운드에듀와 함께
        </p>
        <Link
          href="/auth/signup"
          className="inline-block bg-brand text-white px-8 py-3 rounded-lg text-[15px] font-semibold hover:bg-brand-dark transition"
        >
          무료 회원가입
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-gray-400">리바운드에듀</span>
            <span className="text-xs text-gray-300 ml-3">
              © 2026 주식회사 리바운드
            </span>
          </div>
          <div className="flex gap-5 text-xs text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer">이용약관</span>
            <span className="font-semibold hover:text-gray-600 cursor-pointer">
              개인정보처리방침
            </span>
            <span className="hover:text-gray-600 cursor-pointer">고객센터</span>
          </div>
        </div>
      </footer>

      <ChannelTalk />
    </div>
  );
}
