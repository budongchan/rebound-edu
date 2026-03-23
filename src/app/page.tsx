"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import {
  Star,
  GraduationCap,
  Handshake,
  TrendingUp,
  BookOpen,
  Users,
  BadgeCheck,
  ArrowRight,
  Lightbulb,
  Target,
  Rocket,
  Shield,
  Building2,
  KeyRound,
  Hotel,
  Bot,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ChatBot from "@/components/ui/ChatBot";

// ─── Types ──────────────────────────────────────────────
interface LandingCourse {
  id: string;
  slug?: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  total_lectures: number;
  thumbnail_url: string | null;
  instructorName: string;
  avgRating: number;
  reviewCount: number;
}

// ─── Constants ──────────────────────────────────────────
const GRADIENT_COLORS: Record<string, string> = {
  vacancy: "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  brokerage: "linear-gradient(135deg,#228be6,#4dabf7)",
  hostel: "linear-gradient(135deg,#40c057,#69db7c)",
  ai_automation: "linear-gradient(135deg,#7950f2,#9775fa)",
  investment: "linear-gradient(135deg,#fd7e14,#ffa94d)",
  other: "linear-gradient(135deg,#868e96,#adb5bd)",
};

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  all: LayoutGrid,
  vacancy: Building2,
  brokerage: KeyRound,
  hostel: Hotel,
  ai_automation: Bot,
  investment: TrendingUp,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  vacancy: "공실 해결 및 사업장 운영 노하우",
  brokerage: "부동산 중개 실무와 법률 지식",
  hostel: "숙박업 창업과 운영 전략",
  ai_automation: "업무 자동화와 AI 활용법",
  investment: "부동산 투자 분석과 개발",
};

const CATEGORY_COLORS: Record<
  string,
  { text: string; bg: string; hoverBg: string }
> = {
  vacancy: {
    text: "text-brand",
    bg: "bg-brand-light",
    hoverBg: "group-hover:bg-brand/10",
  },
  brokerage: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100",
  },
  hostel: {
    text: "text-green-600",
    bg: "bg-green-50",
    hoverBg: "group-hover:bg-green-100",
  },
  ai_automation: {
    text: "text-purple-600",
    bg: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
  },
  investment: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    hoverBg: "group-hover:bg-amber-100",
  },
};

// 전문가(강사) 후기 — 리바운드 그룹 실제 교육·컨설팅 실적 기반
const EXPERT_TESTIMONIALS = [
  {
    quote: "전국 100개 이상의 중개센터 오픈을 총괄하면서 쌓은 노하우를, 교육으로 체계화했습니다. 가르치면서 저도 더 성장합니다.",
    name: "김동찬",
    role: "리바운드 그룹 대표 · 공인중개사",
  },
  {
    quote: "8년간 부동산 현장에서 직접 운영하며 겪은 시행착오를 강의로 정리했더니, 수강생들이 같은 실수를 피할 수 있게 됐습니다.",
    name: "김동찬",
    role: "서울 11개 센터 직영 운영",
  },
  {
    quote: "부동산 실무 도서 5권을 출판하면서 정리한 콘텐츠가, 교육 플랫폼에서 더 깊이 있는 강의로 확장됩니다.",
    name: "김동찬",
    role: "부동산 실무 저자 · KAIST MBA",
  },
];

// 수강생(고객) 후기 — 부동찬TV 구독자 및 기존 교육 수강생 피드백 기반
const STUDENT_TESTIMONIALS = [
  {
    quote: "유튜브에서 부동찬TV를 보다가 깊이 있는 내용이 궁금해서 강의를 들었는데, 현장 데이터가 달랐습니다. 실전에서 바로 쓸 수 있었어요.",
    name: "부동찬TV 구독자",
    role: "공인중개사 개업 준비",
  },
  {
    quote: "법인 투자에 대해 책으로만 공부하다가, 실제 운영 숫자를 보여주는 강의를 듣고 확신이 생겼습니다.",
    name: "부동찬TV 구독자",
    role: "법인 투자 검토 중",
  },
  {
    quote: "AI 자동화로 중개 업무를 효율화하는 방법을 배웠습니다. 보고서 작성 시간이 3시간에서 30분으로 줄었어요.",
    name: "부동찬TV 구독자",
    role: "중개사무소 운영",
  },
  {
    quote: "공실 해결 노하우를 배우고 나서 관리 물건의 공실률이 눈에 띄게 줄었습니다. 현장 경험에서 우러나온 강의라 다릅니다.",
    name: "부동찬TV 구독자",
    role: "건물 관리 실무",
  },
];

const FAQ_ITEMS = [
  {
    q: "리바운드에듀는 어떤 플랫폼인가요?",
    a: "리바운드에듀는 부동산·공간사업 분야의 현장 전문가가 직접 교육하는 온라인 교육 플랫폼입니다. 중개업, 숙박업, 공실·사업장, AI자동화, 투자개발 등 5개 카테고리의 전문 강의를 제공합니다.",
  },
  {
    q: "전문가로 등록하려면 어떻게 하나요?",
    a: "회원가입 시 '전문가' 역할을 선택하면 관리자 승인 후 강의를 등록할 수 있습니다. 기획부터 촬영, 편집, 마케팅까지 플랫폼이 지원합니다.",
  },
  {
    q: "강의 수강 후 전문가에게 직접 의뢰할 수 있나요?",
    a: "네, 리바운드에듀의 핵심 기능입니다. 강의를 수강한 후 전문가에게 컨설팅, 개발, 마케팅 등 다양한 서비스를 직접 의뢰할 수 있습니다.",
  },
  {
    q: "결제 방법은 무엇이 있나요?",
    a: "신용카드, 계좌이체, 카카오페이, 네이버페이, 토스 등 다양한 결제 수단을 지원합니다. 결제는 안전하게 처리됩니다.",
  },
  {
    q: "환불 정책은 어떻게 되나요?",
    a: "수강 시작 전에는 전액 환불이 가능하며, 수강 시작 후에는 진도율에 따라 부분 환불이 가능합니다. 자세한 사항은 이용약관을 확인해주세요.",
  },
  {
    q: "수료증은 어떻게 받나요?",
    a: "강의를 100% 완강하면 자동으로 수료증이 발급됩니다. 고유번호가 포함된 PDF 수료증을 다운로드할 수 있습니다.",
  },
];

// ─── Component ──────────────────────────────────────────
export default function HomePage() {
  const [courses, setCourses] = useState<LandingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: coursesData } = await supabase
        .from("courses")
        .select(
          `
          id, slug, title, price, discount_price, category, total_lectures, thumbnail_url,
          instructor:users!courses_instructor_id_fkey(name)
        `,
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!coursesData) {
        setLoading(false);
        return;
      }

      const courseIds = coursesData.map((c) => c.id);
      const { data: reviews } =
        courseIds.length > 0
          ? await supabase
              .from("reviews")
              .select("course_id, rating")
              .in("course_id", courseIds)
          : { data: [] };

      const reviewMap: Record<string, { sum: number; count: number }> = {};
      reviews?.forEach((r) => {
        if (!reviewMap[r.course_id])
          reviewMap[r.course_id] = { sum: 0, count: 0 };
        reviewMap[r.course_id].sum += r.rating;
        reviewMap[r.course_id].count += 1;
      });

      setCourses(
        coursesData.map((c) => {
          const rawInst = c.instructor as
            | { name: string }
            | { name: string }[]
            | null;
          const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
          return {
            id: c.id,
            slug: c.slug,
            title: c.title,
            price: c.price,
            discount_price: c.discount_price,
            category: c.category,
            total_lectures: c.total_lectures,
            thumbnail_url: c.thumbnail_url || null,
            instructorName: inst?.name || "전문가",
            avgRating: reviewMap[c.id]
              ? reviewMap[c.id].sum / reviewMap[c.id].count
              : 0,
            reviewCount: reviewMap[c.id]?.count || 0,
          };
        }),
      );
      setLoading(false);
    };
    load();
  }, []);

  const filtered =
    category === "all"
      ? courses
      : courses.filter((c) => c.category === category);

  const scrollToCourses = (cat: string) => {
    setCategory(cat);
    document
      .getElementById("courses-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ════════════════════════════════════════════ */}
      {/* Header                                      */}
      {/* ════════════════════════════════════════════ */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="inline-flex items-center gap-0.5">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm mr-1.5">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <span className="text-xl font-extrabold text-brand">리바운드</span>
              <span className="text-xl font-extrabold text-gray-900">에듀</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => scrollToCourses("all")}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
              >
                강의
              </button>
              <Link
                href="/auth/signup"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
              >
                전문가 등록
              </Link>
              <button
                onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
              >
                FAQ
              </button>
            </nav>
          </div>
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

      {/* ════════════════════════════════════════════ */}
      {/* Hero Section                                */}
      {/* ════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-brand-light to-white py-20 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-brand/20 rounded-full px-4 py-1.5 mb-6">
            <BadgeCheck size={14} className="text-brand" />
            <span className="text-sm font-semibold text-brand">
              부동산·공간사업 전문가 교육 플랫폼
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            현장 전문가가 <span className="text-brand">직접</span> 가르치는
            <br />
            부동산 <span className="text-brand">실전</span> 교육
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 max-w-[600px] mx-auto font-medium">
            중개업 · 숙박업 · 투자개발 · AI자동화 · 공실해결
          </p>

          <p className="text-sm text-gray-400 mb-8 max-w-[520px] mx-auto leading-relaxed">
            100개+ 센터 오픈을 총괄한 현직 CEO가
            <br />
            8년간의 현장 노하우를 강의로 공개합니다.
            <br />
            교육에서 의뢰까지, 신뢰가 연결되는 플랫폼.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-brand-dark transition"
            >
              전문가로 시작하기
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-gray-50 transition"
            >
              고객으로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* Value Proposition — 3대 핵심 가치            */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand mb-2">
              WHY REBOUND EDU
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              단순한 교육이 아닌,{" "}
              <span className="text-brand">비즈니스</span> 플랫폼
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-brand/30 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mb-5 group-hover:bg-brand/10 transition">
                <GraduationCap size={28} className="text-brand" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                전문성을 교육으로 판매
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                현장에서 검증된 전문가의 노하우와 경험을 온라인 강의로 제작하여
                판매합니다. 기획부터 촬영, 편집, 마케팅까지 플랫폼이 지원합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-brand/30 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition">
                <Handshake size={28} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                수강에서 의뢰까지 연결
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                고객은 강의를 듣고 끝이 아닙니다. 전문가에게 직접 컨설팅과
                서비스를 의뢰할 수 있어, 교육이 곧 비즈니스로 이어집니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-brand/30 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition">
                <TrendingUp size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                공정한 수익 쉐어 모델
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                강의 수익은 물론, 의뢰 연결 시 발생하는 수수료를 전문가와
                플랫폼이 공정하게 나눕니다. 더 많은 가치를 만들수록 더 많이
                돌아옵니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 전문가 vs 고객 — 양면 혜택                   */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand mb-2">
              FOR EVERYONE
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              전문가도, 고객도{" "}
              <span className="text-brand">모두</span> 성장합니다
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 전문가 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                  <Lightbulb size={20} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    전문가라면
                  </h3>
                  <p className="text-xs text-gray-400">
                    나의 전문성이 곧 상품입니다
                  </p>
                </div>
              </div>
              <ul className="space-y-3.5">
                {[
                  "검증된 노하우를 강의로 제작하여 지속적 수익 창출",
                  "고객에게 직접 컨설팅·서비스 의뢰를 받아 비즈니스 확장",
                  "기획·촬영·편집·마케팅 등 플랫폼의 전문 지원 활용",
                  "교육을 통해 개인 브랜딩과 신뢰도 향상",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-brand text-xs font-bold">
                        {i + 1}
                      </span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                전문가로 가입하기 <ArrowRight size={14} />
              </Link>
            </div>

            {/* 고객 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    고객이라면
                  </h3>
                  <p className="text-xs text-gray-400">
                    진짜 전문가에게 배웁니다
                  </p>
                </div>
              </div>
              <ul className="space-y-3.5">
                {[
                  "학원 강사가 아닌 현장 전문가의 실전 노하우를 학습",
                  "수업 후 전문가에게 직접 컨설팅·서비스 의뢰 가능",
                  "전문가 용역 과정 안전관리 모니터링",
                  "분야별 전문가와 네트워킹",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">
                        {i + 1}
                      </span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
              >
                고객으로 가입하기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* How It Works — 프로세스                      */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand mb-2">
              HOW IT WORKS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              전문가의 <span className="text-brand">성장 사이클</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              교육에서 시작해 비즈니스로 확장하는 과정
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Lightbulb,
                color: "text-brand",
                bg: "bg-brand-light",
                title: "강의 등록",
                desc: "전문가가 자신의 노하우를 온라인 강의로 등록합니다. 플랫폼이 기획과 제작을 지원합니다.",
              },
              {
                step: "02",
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50",
                title: "고객 확보",
                desc: "플랫폼의 마케팅과 카테고리 노출로 고객이 유입됩니다. 교육으로 신뢰를 쌓습니다.",
              },
              {
                step: "03",
                icon: Target,
                color: "text-green-600",
                bg: "bg-green-50",
                title: "의뢰 연결",
                desc: "수업에 만족한 고객이 전문가에게 직접 컨설팅·서비스를 의뢰합니다.",
              },
              {
                step: "04",
                icon: Rocket,
                color: "text-purple-600",
                bg: "bg-purple-50",
                title: "수익 창출",
                desc: "강의 수익 + 의뢰 수수료를 통해 지속적으로 수익을 만들어냅니다.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto`}
                    >
                      <Icon size={28} className={item.color} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center sm:right-auto sm:left-1/2 sm:translate-x-5">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 강의 카테고리 & 인기 강의                     */}
      {/* ════════════════════════════════════════════ */}
      <section id="courses-section" className="bg-white pt-16 pb-4 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-brand mb-2">COURSES</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              전문가의 <span className="text-brand">실전 강의</span>
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat.value];
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm px-5 py-2 rounded-full font-medium transition",
                    category === cat.value
                      ? "bg-brand text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200",
                  )}
                >
                  {Icon && <Icon size={14} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="bg-white px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            /* 강의가 아예 없을 때 (pre-launch) */
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-6">
                <Rocket size={36} className="text-brand" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                강의 준비 중입니다
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                현장 전문가들의 실전 강의가 곧 오픈됩니다.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                사전 등록하시면 오픈 시 알림을 보내드립니다.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-brand-dark transition"
              >
                사전 등록하기 <ArrowRight size={14} />
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            /* 해당 카테고리에 강의 없을 때 */
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg mb-1 text-gray-500">
                이 카테고리에는 아직 강의가 없습니다
              </p>
              <p className="text-sm">
                다른 카테고리를 선택하거나, 전체를 확인해보세요.
              </p>
              <button
                onClick={() => setCategory("all")}
                className="mt-4 text-sm text-brand font-semibold hover:underline"
              >
                전체 강의 보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {filtered.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${(course as any).slug || course.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-[140px] flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: course.thumbnail_url
                        ? undefined
                        : (GRADIENT_COLORS[course.category] || GRADIENT_COLORS.other),
                    }}
                  >
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/80 text-sm font-medium">
                        {CATEGORY_LABELS[course.category] || "기타"}
                      </span>
                    )}
                    {course.total_lectures === 0 && (
                      <span className="absolute top-3 right-3 bg-white/90 text-gray-600 text-[10px] font-semibold px-2 py-1 rounded-full">
                        출시 예정
                      </span>
                    )}
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
                      {course.instructorName} · {course.total_lectures > 0 ? `총 ${course.total_lectures}강` : "커리큘럼 준비 중"}
                    </p>
                    {course.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={
                              i <= Math.floor(course.avgRating)
                                ? "#FFB800"
                                : "none"
                            }
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
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* Testimonials — 전문가(강사) 후기              */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand mb-2">
              EXPERT REVIEWS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              전문가(강사)의{" "}
              <span className="text-brand">생생한 후기</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              건축사 · 행정사 · 변호사 · 감정평가사 · 투자자 · 공인중개사
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXPERT_TESTIMONIALS.slice(0, 3).map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-gray-100"
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#FFB800"
                      stroke="#FFB800"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
                    <span className="text-sm font-bold text-brand">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-brand font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {EXPERT_TESTIMONIALS.slice(3, 6).map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-gray-100"
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#FFB800"
                      stroke="#FFB800"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
                    <span className="text-sm font-bold text-brand">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-brand font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* Testimonials — 수강생(고객) 후기              */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 mb-2">
              STUDENT REVIEWS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              수강생(고객)의{" "}
              <span className="text-blue-600">솔직한 후기</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              숙박업 예비 창업자 · 중개사무소 실무자 · 전업투자자 · 건물주
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STUDENT_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#FFB800"
                      stroke="#FFB800"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 신뢰의 핵심 메시지 — 배너                     */}
      {/* ════════════════════════════════════════════ */}
      <section className="bg-gray-900 py-16 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <Shield size={36} className="text-brand mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-4">
            전문가는 고객의 <span className="text-brand">신뢰</span>를 얻고
            <br />
            고객은 전문가의 <span className="text-brand">노하우</span>를 얻다
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-[550px] mx-auto">
            이제 누구나 강의를 해서 나를 알려야 합니다.
            <br className="hidden sm:block" />
            전문가와 기업이 자신과 서비스를 판매하는 가장 효율적인 방식,
            <br className="hidden sm:block" />
            <strong className="text-gray-200">교육으로 신뢰를 판다.</strong>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* Stats                                       */}
      {/* ════════════════════════════════════════════ */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-brand">100+</p>
              <p className="text-sm text-gray-500 mt-1">센터 오픈 총괄</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">8년+</p>
              <p className="text-sm text-gray-500 mt-1">부동산 현장 경력</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">5권</p>
              <p className="text-sm text-gray-500 mt-1">부동산 실무 출판</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand">2만+</p>
              <p className="text-sm text-gray-500 mt-1">유튜브 구독자</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* FAQ — 자주 묻는 질문                          */}
      {/* ════════════════════════════════════════════ */}
      <section id="faq-section" className="py-16 px-6 bg-gray-50">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              자주 묻는 <span className="text-brand">질문</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  i < FAQ_ITEMS.length - 1 && "border-b border-gray-100",
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="text-[15px] font-semibold text-gray-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-gray-400 transition-transform flex-shrink-0",
                      openFaq === i && "rotate-180",
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* CTA                                         */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            신뢰와 노하우가 만나는 곳
          </h2>
          <p className="text-base text-gray-500 mb-8 leading-relaxed">
            전문가는 교육으로 신뢰를 쌓고, 고객은 진짜 노하우를 얻습니다.
            <br />
            리바운드에듀에서 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-brand-dark transition"
            >
              전문가로 시작하기
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-gray-50 transition"
            >
              고객으로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* Footer                                      */}
      {/* ════════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 bg-gray-50">
        {/* Top: Logo + Links */}
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            {/* Left: Logo + description */}
            <div>
              <div className="inline-flex items-center gap-0.5 mb-4">
                
            <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-sm">R</span>
            </div>
<span className="text-lg font-extrabold text-brand">
                  리바운드
                </span>
                <span className="text-lg font-extrabold text-gray-900">
                  에듀
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[300px]">
                부동산·공간사업 전문 온라인 교육 플랫폼.
                <br />
                전문가는 교육으로 신뢰를 쌓고, 고객은 검증된 노하우를 배웁니다.
              </p>
            </div>

            {/* Right: Quick links */}
            <div className="flex gap-12">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3">서비스</p>
                <div className="space-y-2">
                  <Link
                    href="/auth/signup"
                    className="block text-xs text-gray-400 hover:text-gray-600"
                  >
                    전문가 등록
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block text-xs text-gray-400 hover:text-gray-600"
                  >
                    고객 가입
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block text-xs text-gray-400 hover:text-gray-600"
                  >
                    로그인
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3">
                  고객지원
                </p>
                <div className="space-y-2">
                  <span className="block text-xs text-gray-400">
                    이메일: support@rebound.co.kr
                  </span>
                  <span className="block text-xs text-gray-400">
                    운영: 평일 10:00~18:00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Legal info */}
        <div className="border-t border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <div className="text-[11px] text-gray-400 leading-relaxed space-y-1">
              <p>
                상호: 주식회사 리바운드 | 대표: 김동찬 | 사업자등록번호:
                234-86-03564 | 통신판매업신고번호: 제2025-서울중구-1637호
              </p>
              <p>
                주소: 서울특별시 중구 청파로103길 7 | 이메일:
                support@rebound.co.kr
              </p>
              <div className="flex flex-wrap gap-3 mt-3 items-center">
                <a href="#" className="hover:text-gray-600">
                  이용약관
                </a>
                <span className="text-gray-300">|</span>
                <a href="#" className="font-semibold hover:text-gray-600">
                  개인정보처리방침
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="https://www.ftc.go.kr/bizCommPop.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600"
                >
                  사업자정보확인
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="mailto:admin@rebound.io.kr"
                  className="hover:text-gray-600"
                >
                  고객센터
                </a>
              </div>
            </div>
            <p className="text-[11px] text-gray-300 mt-4">
              &copy; 2026 주식회사 리바운드. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
