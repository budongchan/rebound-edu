"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice, formatDuration } from "@/lib/utils";
import { getCourseContent, type CourseContent } from "@/data/course-details";
import Badge from "@/components/ui/Badge";
import {
  Star,
  Clock,
  BookOpen,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  User,
  Award,
  FileText,
  Download,
  Shield,
  Users,
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  category: string;
  difficulty: string | null;
  total_lectures: number;
  total_duration_sec: number;
  thumbnail_url: string | null;
  instructor: { id: string; name: string; avatar_url: string | null } | null;
}

interface Lecture {
  id: string;
  section_title: string | null;
  order_num: number;
  title: string;
  duration_sec: number;
  is_preview: boolean;
}

interface Review {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  user: { name: string } | null;
}

interface RelatedCourse {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  instructor: { name: string } | null;
}

const DIFF_LABELS: Record<string, string> = {
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

// ─── Enroll CTA Button ─────────────────────────────────
function EnrollButton({
  enrolled,
  enrolling,
  isLoggedIn,
  displayPrice,
  onEnroll,
  className = "",
}: {
  enrolled: boolean;
  enrolling: boolean;
  isLoggedIn: boolean;
  displayPrice: number;
  onEnroll: () => void;
  className?: string;
}) {
  if (enrolled) {
    return (
      <Link
        href="/student"
        className={`block w-full text-center py-3.5 rounded-lg bg-green-500 text-white font-semibold text-[15px] hover:bg-green-600 transition ${className}`}
      >
        내 강의실로 이동
      </Link>
    );
  }
  return (
    <button
      onClick={onEnroll}
      disabled={enrolling}
      className={`w-full py-3.5 rounded-lg bg-brand text-white font-semibold text-[15px] hover:bg-brand-dark transition disabled:opacity-50 ${className}`}
    >
      {enrolling
        ? "처리 중..."
        : !isLoggedIn
          ? "Google로 로그인하고 수강신청"
          : displayPrice === 0
            ? "무료 수강 신청"
            : `수강 신청 · ₩${formatPrice(displayPrice)}`}
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function PublicCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllCurriculum, setShowAllCurriculum] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const content: CourseContent | null = getCourseContent(id as string);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: c } = await supabase
        .from("courses")
        .select(
          `*, instructor:users!courses_instructor_id_fkey(id, name, avatar_url)`
        )
        .eq("id", id)
        .single();

      if (!c) {
        router.push("/");
        return;
      }
      setCourse({
        ...c,
        instructor: Array.isArray(c.instructor)
          ? c.instructor[0]
          : c.instructor,
      });

      const { data: lecs } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", id)
        .order("order_num");
      setLectures(lecs || []);

      const { data: revs } = await supabase
        .from("reviews")
        .select(`*, user:users!reviews_user_id_fkey(name)`)
        .eq("course_id", id)
        .order("created_at", { ascending: false });
      const revList = (revs || []).map((r) => ({
        ...r,
        user: Array.isArray(r.user) ? r.user[0] : r.user,
      }));
      setReviews(revList);
      if (revList.length > 0) {
        setAvgRating(
          revList.reduce((s, r) => s + r.rating, 0) / revList.length
        );
      }

      // Related courses
      const { data: related } = await supabase
        .from("courses")
        .select(
          `id, title, price, discount_price, category, instructor:users!courses_instructor_id_fkey(name)`
        )
        .eq("status", "published")
        .neq("id", id)
        .eq("category", c.category)
        .limit(3);
      if (related) {
        setRelatedCourses(
          related.map((r) => ({
            ...r,
            instructor: Array.isArray(r.instructor)
              ? r.instructor[0]
              : r.instructor,
          }))
        );
      }

      // Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .single();
        if (profile) {
          const { data: enroll } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", profile.id)
            .eq("course_id", id)
            .maybeSingle();
          setEnrolled(!!enroll);
        }
      }

      setLoading(false);
    };
    load();
  }, [id, router]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/courses/${id}`,
      },
    });
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      handleGoogleLogin();
      return;
    }
    setEnrolling(true);
    const supabase = createClient();
    try {
      const prepareRes = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) {
        alert(prepareData.error || "결제 준비에 실패했습니다.");
        setEnrolling(false);
        return;
      }
      if (prepareData.free) {
        setEnrolled(true);
        setEnrolling(false);
        alert("수강 신청이 완료되었습니다!");
        return;
      }
      const PortOne = await import("@portone/browser-sdk/v2");
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (!storeId || !channelKey) {
        alert("결제 시스템이 설정되지 않았습니다.");
        setEnrolling(false);
        return;
      }
      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: prepareData.paymentId!,
        orderName: prepareData.orderName!,
        totalAmount: prepareData.totalAmount!,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: {
          fullName: prepareData.customer?.name,
          email: prepareData.customer?.email,
          phoneNumber: prepareData.customer?.phone || undefined,
        },
        redirectUrl: `${window.location.origin}/student/payment-result`,
      });
      if (response?.code != null) {
        if (
          response.code !== "FAILURE_TYPE_PG" &&
          response.code !== "PAY_PROCESS_CANCELED"
        ) {
          alert(response.message || "결제가 취소되었습니다.");
        }
        setEnrolling(false);
        return;
      }
      const completeRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: prepareData.paymentId }),
      });
      const completeData = await completeRes.json();
      if (completeRes.ok && completeData.success) {
        setEnrolled(true);
        alert("결제가 완료되었습니다!");
      } else {
        alert(completeData.error || "결제 검증에 실패했습니다.");
      }
    } catch (err) {
      console.error("결제 오류:", err);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const discountPct = course.discount_price
    ? Math.round((1 - course.discount_price / course.price) * 100)
    : 0;
  const displayPrice = course.discount_price || course.price;

  // Group lectures by section
  const lectureSections: { title: string; lectures: Lecture[] }[] = [];
  lectures.forEach((l) => {
    const sectionTitle = l.section_title || "커리큘럼";
    const existing = lectureSections.find((s) => s.title === sectionTitle);
    if (existing) existing.lectures.push(l);
    else lectureSections.push({ title: sectionTitle, lectures: [l] });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ Header ═══ */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-xl font-extrabold text-brand">리바운드</span>
            <span className="text-xl font-extrabold text-gray-900">에듀</span>
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/auth/select-role"
                className="text-sm text-white bg-brand px-5 py-2 rounded-lg font-semibold hover:bg-brand-dark transition"
              >
                내 강의실
              </Link>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                >
                  로그인
                </button>
                <Link
                  href="/auth/signup"
                  className="text-sm text-white bg-brand px-5 py-2 rounded-lg font-semibold hover:bg-brand-dark transition"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ Hero Banner ═══ */}
      <div
        className="relative h-[240px] sm:h-[320px] flex items-center justify-center"
        style={{
          background:
            course.thumbnail_url
              ? `url(${course.thumbnail_url}) center/cover`
              : GRADIENT_COLORS[course.category] || GRADIENT_COLORS.other,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative text-center text-white px-6 max-w-[800px]">
          <div className="flex gap-2 justify-center mb-4">
            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
              {CATEGORY_LABELS[course.category] || course.category}
            </span>
            {course.difficulty && (
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                {DIFF_LABELS[course.difficulty]}
              </span>
            )}
            {displayPrice === 0 && (
              <span className="bg-green-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                무료
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="text-sm sm:text-base text-white/80">
              {course.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/70">
            <span className="font-medium text-white">
              {course.instructor?.name}
            </span>
            {course.total_duration_sec > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={14} />{" "}
                {formatDuration(course.total_duration_sec)}
              </span>
            )}
            {reviews.length > 0 && (
              <span className="flex items-center gap-1">
                <Star size={14} fill="#FFB800" stroke="#FFB800" />
                {avgRating.toFixed(1)} ({reviews.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Highlight Tags ═══ */}
      {content?.highlights && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[960px] mx-auto px-6 py-4 flex gap-3 justify-center flex-wrap">
            {content.highlights.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand bg-brand-light px-4 py-2 rounded-full"
              >
                <CheckCircle2 size={14} />
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <div className="max-w-[960px] mx-auto px-6 py-8">
        <Link
          href="/#courses-section"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          강의 목록으로
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left Column ─── */}
          <div className="lg:col-span-2 space-y-8">
            {/* § 이런 분께 추천합니다 */}
            {content?.targets && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-brand" />
                  <h2 className="text-base font-bold">
                    이런 분께 추천합니다
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.targets.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-gray-50 rounded-lg p-4"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-brand flex-shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* § 수강 후 달라지는 것 (Before/After) */}
            {content?.beforeAfter && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight size={18} className="text-brand" />
                  <h2 className="text-base font-bold">
                    수강 후 달라지는 것
                  </h2>
                </div>
                <div className="space-y-4">
                  {content.beforeAfter.map((ba, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                          Before
                        </p>
                        <p className="text-sm text-gray-600">{ba.before}</p>
                      </div>
                      <div className="bg-brand-light rounded-lg p-4 border-l-4 border-brand">
                        <p className="text-[10px] font-bold text-brand uppercase mb-1.5">
                          After
                        </p>
                        <p className="text-sm text-gray-800 font-medium">
                          {ba.after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* § 강사 소개 */}
            {content?.instructor && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-brand" />
                  <h2 className="text-base font-bold">강사 소개</h2>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-brand">
                      {content.instructor.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {content.instructor.name}
                    </h3>
                    <p className="text-sm text-brand font-medium mb-3">
                      {content.instructor.title}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {content.instructor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {content.instructor.credentials.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full"
                        >
                          <Award size={12} className="text-brand" />
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* § 강의 소개 */}
            {course.description && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-brand" />
                  <h2 className="text-base font-bold">강의 소개</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </section>
            )}

            {/* § 커리큘럼 (정적 데이터 or DB 데이터) */}
            {(content?.curriculum || lectures.length > 0) && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle size={18} className="text-brand" />
                  <h2 className="text-base font-bold">커리큘럼</h2>
                </div>

                {/* 정적 커리큘럼 (course-details.ts) */}
                {content?.curriculum && (
                  <div className="space-y-5">
                    {(showAllCurriculum
                      ? content.curriculum
                      : content.curriculum.slice(0, 2)
                    ).map((part, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center text-xs font-bold text-brand">
                            {i + 1}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900">
                            {part.part}
                          </h3>
                        </div>
                        <div className="ml-9 space-y-1.5">
                          {part.items.map((item, j) => (
                            <div
                              key={j}
                              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50"
                            >
                              <PlayCircle
                                size={14}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-700">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {content.curriculum.length > 2 && !showAllCurriculum && (
                      <button
                        onClick={() => setShowAllCurriculum(true)}
                        className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                      >
                        전체 커리큘럼 보기
                        <ChevronDown size={16} />
                      </button>
                    )}
                  </div>
                )}

                {/* DB 커리큘럼 (lectures 테이블) */}
                {!content?.curriculum && lectures.length > 0 && (
                  <div className="space-y-4">
                    {lectureSections.map((section) => (
                      <div key={section.title}>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                          {section.title}
                        </p>
                        <div className="space-y-1">
                          {section.lectures.map((l) => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle
                                  size={14}
                                  className="text-gray-400"
                                />
                                <span className="text-sm text-gray-700">
                                  {l.title}
                                </span>
                                {l.is_preview && (
                                  <Badge color="green">미리보기</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDuration(l.duration_sec)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* § 제공 자료 */}
            {content?.materials && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Download size={18} className="text-brand" />
                  <h2 className="text-base font-bold">제공 자료</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.materials.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg p-4"
                    >
                      <FileText
                        size={18}
                        className="text-brand flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{m}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* § 수강 후기 */}
            {reviews.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} className="text-brand" />
                  <h2 className="text-base font-bold">
                    수강 후기 ({reviews.length})
                  </h2>
                </div>
                {/* Rating summary */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">
                      {avgRating.toFixed(1)}
                    </p>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i <= Math.round(avgRating) ? "#FFB800" : "none"
                          }
                          stroke="#FFB800"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {reviews.length}개 후기
                    </p>
                  </div>
                </div>
                {/* Review list */}
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-b border-gray-50 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i <= r.rating ? "#FFB800" : "none"}
                              stroke="#FFB800"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {r.user?.name || "수강생"}
                        </span>
                      </div>
                      {r.content && (
                        <p className="text-sm text-gray-600">{r.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* § FAQ */}
            {content?.faq && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-bold mb-4">자주 묻는 질문</h2>
                <div className="divide-y divide-gray-100">
                  {content.faq.map((f, i) => (
                    <div key={i}>
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === i ? null : i)
                        }
                        className="w-full flex items-center justify-between py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-gray-900 pr-4">
                          Q. {f.q}
                        </span>
                        {openFaq === i ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>
                      {openFaq === i && (
                        <p className="text-sm text-gray-600 pb-4 leading-relaxed">
                          A. {f.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* § 반복 CTA (본문 하단) */}
            <section className="bg-brand-light rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {displayPrice === 0
                  ? "지금 무료로 수강하세요"
                  : "지금 바로 수강을 시작하세요"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {displayPrice === 0
                  ? "Google 계정으로 간편하게 시작"
                  : `₩${formatPrice(displayPrice)}으로 전문가의 노하우를 배우세요`}
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  7일 이내 100% 환불 보장
                </span>
              </div>
              <EnrollButton
                enrolled={enrolled}
                enrolling={enrolling}
                isLoggedIn={isLoggedIn}
                displayPrice={displayPrice}
                onEnroll={handleEnroll}
                className="max-w-[360px] mx-auto"
              />
            </section>

            {/* § 관련 강의 */}
            {relatedCourses.length > 0 && (
              <section>
                <h2 className="text-base font-bold mb-4">관련 강의</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedCourses.map((rc) => (
                    <Link
                      key={rc.id}
                      href={`/courses/${rc.id}`}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        className="h-[100px] flex items-center justify-center"
                        style={{
                          background:
                            GRADIENT_COLORS[rc.category] ||
                            GRADIENT_COLORS.other,
                        }}
                      >
                        <span className="text-white/80 text-xs font-medium">
                          {CATEGORY_LABELS[rc.category]}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                          {rc.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {rc.instructor?.name}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {(rc.discount_price || rc.price) === 0
                            ? "무료"
                            : `₩${formatPrice(rc.discount_price || rc.price)}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ─── Right Sidebar (Sticky CTA) ─── */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              {/* Price */}
              <div>
                {discountPct > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-red-500">
                      {discountPct}%
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₩{formatPrice(course.price)}
                    </span>
                  </div>
                )}
                <p className="text-3xl font-bold text-gray-900">
                  {displayPrice === 0
                    ? "무료"
                    : `₩${formatPrice(displayPrice)}`}
                </p>
              </div>

              <EnrollButton
                enrolled={enrolled}
                enrolling={enrolling}
                isLoggedIn={isLoggedIn}
                displayPrice={displayPrice}
                onEnroll={handleEnroll}
              />

              {!isLoggedIn && (
                <p className="text-xs text-gray-400 text-center">
                  Google 계정으로 간편하게 시작하세요
                </p>
              )}

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
                <Shield size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  7일 이내 100% 환불 보장
                </span>
              </div>

              {/* Course Info Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">강사</span>
                  <span className="font-medium text-gray-900">
                    {course.instructor?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">카테고리</span>
                  <span className="font-medium text-gray-900">
                    {CATEGORY_LABELS[course.category] || course.category}
                  </span>
                </div>
                {course.difficulty && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">난이도</span>
                    <span className="font-medium text-gray-900">
                      {DIFF_LABELS[course.difficulty]}
                    </span>
                  </div>
                )}
                {course.total_lectures > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">강의 수</span>
                    <span className="font-medium text-gray-900">
                      {course.total_lectures}강
                    </span>
                  </div>
                )}
                {course.total_duration_sec > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">총 시간</span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(course.total_duration_sec)}
                    </span>
                  </div>
                )}
                {content?.materials && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">제공 자료</span>
                    <span className="font-medium text-gray-900">
                      {content.materials.length}개
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Fixed Bottom Bar ═══ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
        <div className="flex items-center justify-between gap-4 max-w-[960px] mx-auto">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {displayPrice === 0 ? "무료" : `₩${formatPrice(displayPrice)}`}
            </p>
          </div>
          {enrolled ? (
            <Link
              href="/student"
              className="flex-1 text-center py-3 rounded-lg bg-green-500 text-white font-semibold text-[15px] hover:bg-green-600 transition"
            >
              내 강의실
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="flex-1 py-3 rounded-lg bg-brand text-white font-semibold text-[15px] hover:bg-brand-dark transition disabled:opacity-50"
            >
              {enrolling
                ? "처리 중..."
                : !isLoggedIn
                  ? "Google 로그인 후 수강신청"
                  : displayPrice === 0
                    ? "무료 수강 신청"
                    : "수강 신청"}
            </button>
          )}
        </div>
      </div>

      <div className="h-20 lg:hidden" />

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <div className="inline-flex items-center gap-0.5 mb-3">
                <span className="text-lg font-extrabold text-brand">리바운드</span>
                <span className="text-lg font-extrabold text-gray-900">에듀</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[300px]">
                부동산·공간사업 전문 온라인 교육 플랫폼.
                <br />
                전문가는 교육으로 신뢰를 쌓고, 고객은 검증된 노하우를 배웁니다.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-3">고객지원</p>
              <div className="space-y-2">
                <span className="block text-xs text-gray-400">이메일: support@rebound.co.kr</span>
                <span className="block text-xs text-gray-400">운영: 평일 10:00~18:00</span>
              </div>
            </div>
          </div>
        </div>
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
                <a href="#" className="hover:text-gray-600">이용약관</a>
                <span className="text-gray-300">|</span>
                <a href="#" className="font-semibold hover:text-gray-600">개인정보처리방침</a>
                <span className="text-gray-300">|</span>
                <a
                  href="https://www.ftc.go.kr/bizCommPop.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600"
                >
                  사업자정보확인
                </a>
              </div>
            </div>
            <p className="text-[11px] text-gray-300 mt-4">
              &copy; 2026 주식회사 리바운드. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
