"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice, formatDuration } from "@/lib/utils";
import { getCourseContent, type CourseContent, type ScheduleInfo, type BookCover } from "@/data/course-details";
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
  Calendar,
  MapPin,
  Monitor,
  Video,
  ExternalLink,
  Share2,
  Link2,
  MessageCircle,
  Youtube,
  Copy,
  X,
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
  slug: string | null;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  instructor: { name: string } | null;
}

interface QnaQuestion {
  id: string;
  user_id: string;
  course_id: string;
  content: string;
  created_at: string;
  user: { name: string; avatar_url: string | null } | null;
  answers: QnaAnswer[];
}

interface QnaAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: { name: string; avatar_url: string | null } | null;
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

const TAB_ITEMS = [
  { key: "intro", label: "소개" },
  { key: "curriculum", label: "커리큘럼" },
  { key: "creator", label: "강사" },
  { key: "reviews", label: "후기" },
  { key: "qna", label: "질문·답변" },
] as const;

type TabKey = (typeof TAB_ITEMS)[number]["key"];

// ─── 3D Book Mockup ─────────────────────────────────
function BookMockup3D() {
  return (
    <div className="flex justify-center py-2">
      <div
        className="relative"
        style={{
          perspective: "1200px",
          width: "220px",
          height: "310px",
        }}
      >
        {/* Book wrapper with 3D rotation */}
        <div
          style={{
            width: "220px",
            height: "310px",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: "rotateY(-22deg)",
          }}
        >
          {/* Front Cover */}
          <div
            style={{
              width: "220px",
              height: "310px",
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "left center",
              transform: "translateZ(12px)",
              background: "#fff",
              borderRadius: "0 4px 4px 0",
              overflow: "hidden",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.25), 0 0 6px rgba(0,0,0,0.08)",
            }}
          >
            {/* Orange sidebar */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "22px", height: "100%", background: "#FF6600" }} />

            {/* Content */}
            <div style={{ marginLeft: "22px", padding: "28px 20px 18px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                {/* Tag */}
                <span style={{ display: "inline-block", fontSize: "7px", fontWeight: 700, color: "#FF6600", border: "1.2px solid #FF6600", padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.5px", marginBottom: "16px", fontFamily: "'Noto Sans KR', sans-serif" }}>
                  AI 시스템 설계서
                </span>

                {/* Title */}
                <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "15px", fontWeight: 900, color: "#222", marginBottom: "2px", lineHeight: 1.3 }}>
                  <span style={{ color: "#FF6600", fontSize: "17px" }}>비싼 사람들</span>을 위한,
                </div>
                <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "29px", fontWeight: 900, color: "#111", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
                  값싼 <span style={{ color: "#FF6600" }}>AI</span><br />활용법
                </div>

                {/* Divider */}
                <div style={{ width: "28px", height: "2.5px", background: "#FF6600", margin: "10px 0" }} />

                {/* Subtitle */}
                <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "14px", fontWeight: 600, color: "#222", letterSpacing: "-0.3px" }}>
                  1시간 × <span style={{ color: "#FF6600", fontWeight: 700 }}>AI</span> = 100시간
                </div>
                <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "7.5px", color: "#bbb", marginTop: "6px", lineHeight: 1.6 }}>
                  코딩 없이 시작하는<br />나만의 AI 업무 자동화 시스템
                </div>
              </div>

              {/* Bottom: Author + Publisher */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "5.5px", color: "#ccc", letterSpacing: "1.5px", marginBottom: "1px" }}>지은이</div>
                  <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "13px", fontWeight: 900, color: "#111" }}>김동찬</div>
                  <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "5.5px", color: "#bbb" }}>리바운드 그룹 CEO · AI 시스템 설계자</div>
                </div>
                <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "7px", fontWeight: 700, color: "#ddd", letterSpacing: "2px" }}>BOOKK</div>
              </div>
            </div>
          </div>

          {/* Spine (side) */}
          <div
            style={{
              width: "24px",
              height: "310px",
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "left center",
              transform: "rotateY(-90deg) translateX(-12px)",
              background: "linear-gradient(to right, #FF6600, #e85d00)",
            }}
          />

          {/* Back shadow page effect */}
          <div
            style={{
              width: "220px",
              height: "310px",
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "left center",
              transform: "translateZ(-12px)",
              background: "#f0f0f0",
              borderRadius: "0 4px 4px 0",
              boxShadow: "inset 4px 0 8px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

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

// ─── Toast Component ─────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
        <CheckCircle2 size={16} className="text-green-400" />
        {message}
      </div>
    </div>
  );
}

// ─── Share Dropdown ─────────────────────────────────
function ShareDropdown({
  courseTitle,
  onToast,
}: {
  courseTitle: string;
  onToast: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onToast("복사되었습니다");
    } catch {
      onToast("복사에 실패했습니다");
    }
    setOpen(false);
  };

  const handleKakaoShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${courseTitle} - 리바운드에듀`);
    window.open(
      `https://story.kakao.com/share?url=${url}&text=${text}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
        aria-label="공유하기"
      >
        <Share2 size={18} className="text-white" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-50 animate-fade-in">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Link2 size={16} className="text-gray-400" />
            링크 복사
          </button>
          <button
            onClick={handleKakaoShare}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <MessageCircle size={16} className="text-yellow-500" />
            카카오톡 공유
          </button>
        </div>
      )}
    </div>
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllCurriculum, setShowAllCurriculum] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<TabKey>("intro");
  const sectionRefs = useRef<Record<TabKey, HTMLDivElement | null>>({
    intro: null,
    qna: null,
    curriculum: null,
    creator: null,
    reviews: null,
  });

  // QnA
  const [qnaQuestions, setQnaQuestions] = useState<QnaQuestion[]>([]);
  const [qnaText, setQnaText] = useState("");
  const [qnaSubmitting, setQnaSubmitting] = useState(false);

  // Reviews expand
  const [showAllReviews, setShowAllReviews] = useState(false);

  const content: CourseContent | null = getCourseContent(id as string);

  // ─── Data Load ───
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // slug 또는 UUID로 조회
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string);
      const { data: c } = await supabase
        .from("courses")
        .select(
          `*, slug, instructor:users!courses_instructor_id_fkey(id, name, avatar_url)`
        )
        .eq(isUuid ? "id" : "slug", id)
        .single();

      if (!c) {
        router.push("/");
        return;
      }

      // UUID로 접근했는데 slug이 있으면 slug URL로 리다이렉트
      if (isUuid && c.slug) {
        router.replace(`/courses/${c.slug}`);
        return;
      }

      setCourse({
        ...c,
        instructor: Array.isArray(c.instructor)
          ? c.instructor[0]
          : c.instructor,
      });

      const courseUuid = c.id;

      const { data: lecs } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", courseUuid)
        .order("order_num");
      setLectures(lecs || []);

      const { data: revs } = await supabase
        .from("reviews")
        .select(`*, user:users!reviews_user_id_fkey(name)`)
        .eq("course_id", courseUuid)
        .order("created_at", { ascending: false });
      const revList = (revs || []).map((r: any) => ({
        ...r,
        user: Array.isArray(r.user) ? r.user[0] : r.user,
      }));
      setReviews(revList);
      if (revList.length > 0) {
        setAvgRating(
          revList.reduce((s: number, r: any) => s + r.rating, 0) / revList.length
        );
      }

      // Related courses
      const { data: related } = await supabase
        .from("courses")
        .select(
          `id, slug, title, price, discount_price, category, instructor:users!courses_instructor_id_fkey(name)`
        )
        .eq("status", "published")
        .neq("id", courseUuid)
        .eq("category", c.category)
        .limit(3);
      if (related) {
        setRelatedCourses(
          related.map((r: any) => ({
            ...r,
            instructor: Array.isArray(r.instructor)
              ? r.instructor[0]
              : r.instructor,
          }))
        );
      }

      // QnA questions (use actual course UUID, not slug)
      await loadQna(supabase, c.id);

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
          setCurrentUserId(profile.id);
          const { data: enroll } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", profile.id)
            .eq("course_id", c.id)
            .maybeSingle();
          setEnrolled(!!enroll);
        }
      }

      setLoading(false);
    };
    load();
  }, [id, router]);

  const loadQna = async (supabase?: any, courseUuid?: string) => {
    const sb = supabase || createClient();
    const cid = courseUuid || course?.id || id;
    const { data: questions } = await sb
      .from("qna_questions")
      .select(`*, user:users!qna_questions_user_id_fkey(name, avatar_url), answers:qna_answers(*, user:users!qna_answers_user_id_fkey(name, avatar_url))`)
      .eq("course_id", cid)
      .order("created_at", { ascending: false });

    if (questions) {
      const qList: QnaQuestion[] = questions.map((q: any) => ({
        ...q,
        user: Array.isArray(q.user) ? q.user[0] : q.user,
        answers: (q.answers || []).map((a: any) => ({
          ...a,
          user: Array.isArray(a.user) ? a.user[0] : a.user,
        })),
      }));
      setQnaQuestions(qList);
    }
  };

  // ─── Intersection Observer for active tab ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute("data-section") as TabKey;
            if (key) setActiveTab(key);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    const keys: TabKey[] = ["intro", "curriculum", "creator", "reviews", "qna"];
    keys.forEach((key) => {
      const el = sectionRefs.current[key];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);

  // ─── Countdown Timer (마감 = 개강일 전날 23:59:59) ───
  useEffect(() => {
    if (!content?.schedule?.date) return;

    // Parse Korean date like "2026년 3월 23일 (일)"
    const dateMatch = content.schedule.date.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (!dateMatch) return;

    const classYear = parseInt(dateMatch[1]);
    const classMonth = parseInt(dateMatch[2]) - 1;
    const classDay = parseInt(dateMatch[3]);

    // Deadline = day before class at 23:59:59
    const deadline = new Date(classYear, classMonth, classDay - 1, 23, 59, 59);

    const tick = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [content]);

  const scrollToSection = (key: TabKey) => {
    const el = sectionRefs.current[key];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // ─── Handlers ───
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
    try {
      const prepareRes = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course?.id || id }),
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
      // 토스페이먼츠 결제창 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        alert("결제 시스템이 설정되지 않았습니다.");
        setEnrolling(false);
        return;
      }
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const tossPayment = tossPayments.payment({ customerKey: authUser?.id || "guest" });

      await tossPayment.requestPayment({
        method: "CARD" as const,
        amount: { currency: "KRW" as const, value: prepareData.totalAmount! },
        orderId: prepareData.orderId!,
        orderName: prepareData.orderName!,
        customerName: prepareData.customerName || undefined,
        customerEmail: prepareData.customerEmail || undefined,
        successUrl: `${window.location.origin}/student/payment-result?orderId=${prepareData.orderId}&amount=${prepareData.totalAmount}`,
        failUrl: `${window.location.origin}/student/payment-result?error=true`,
      });
    } catch (err) {
      console.error("결제 오류:", err);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleQnaSubmit = async () => {
    if (!isLoggedIn) {
      handleGoogleLogin();
      return;
    }
    if (!qnaText.trim() || !currentUserId) return;
    setQnaSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from("qna_questions").insert({
        user_id: currentUserId,
        course_id: course?.id || id,
        content: qnaText.trim(),
      });
      setQnaText("");
      await loadQna(supabase);
    } catch (err) {
      console.error("QnA 등록 오류:", err);
      alert("질문 등록에 실패했습니다.");
    } finally {
      setQnaSubmitting(false);
    }
  };

  // ─── Loading / Empty ───
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

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* ═══ Header ═══ */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-0.5">
            
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-lg">R</span>
            </div>
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

      {/* ═══ Tab Navigation (Sticky) ═══ */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[960px] mx-auto px-6">
          <nav className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`relative flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-brand"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.key === "reviews" && reviews.length > 0 && (
                  <span className="ml-1 text-xs">
                    {reviews.length}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

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

            {/* ══════════ SECTION: 소개 (intro) ══════════ */}
            <div
              ref={(el) => { sectionRefs.current.intro = el; }}
              data-section="intro"
            >
              {/* 출간 예정 도서 목업 (AI 강의만) */}
              {content?.schedule && course.category === "ai_automation" && (
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, #FF6600 0%, transparent 50%)" }} />
                  <div className="relative flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <BookMockup3D />
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="inline-block text-[10px] font-bold text-brand bg-brand/10 px-3 py-1 rounded-full mb-3 tracking-wider">
                        2026년 출간 예정
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                        이 강의의 내용이<br className="sm:hidden" /> 책으로 출간됩니다
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        강의에서 다루는 AI 활용 실무 노하우를<br className="hidden sm:block" />
                        체계적으로 정리한 실전 가이드북
                      </p>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-xs text-gray-500">저자</span>
                        <span className="text-sm font-bold text-white">김동찬</span>
                        <span className="text-xs text-gray-600">|</span>
                        <span className="text-xs text-gray-500">부크크 출판</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 이런 분께 추천합니다 */}
              {content?.targets && (
                <section className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">
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

              {/* 수강 후 달라지는 것 (Before/After) */}
              {content?.beforeAfter && (
                <section className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowRight size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">
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

              {/* 강의 소개 */}
              {(content?.introSections || course.description) && (
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <BookOpen size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">강의 소개</h2>
                  </div>
                  {content?.introSections ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {content.introSections.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <div className="text-2xl mb-2">{s.icon}</div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1.5">{s.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {course.description}
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* ══════════ SECTION: 커리큘럼 (curriculum) ══════════ */}
            <div
              ref={(el) => { sectionRefs.current.curriculum = el; }}
              data-section="curriculum"
            >
              {(content?.curriculum || lectures.length > 0) && (
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <PlayCircle size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">커리큘럼</h2>
                  </div>

                  {/* Static curriculum (course-details.ts) */}
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

                  {/* DB curriculum (lectures table) */}
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

              {/* 제공 자료 */}
              {content?.materials && content.materials.length > 0 && (
                <section className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Download size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">제공 자료</h2>
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

              {/* FAQ */}
              {content?.faq && (
                <section className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
                  <h2 className="text-lg font-extrabold mb-4">자주 묻는 질문</h2>
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
            </div>

            {/* ══════════ SECTION: 강사 (creator) ══════════ */}
            <div
              ref={(el) => { sectionRefs.current.creator = el; }}
              data-section="creator"
            >
              {/* 강사 소개 */}
              {content?.instructor && (
                <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    {/* 프로필 헤더 */}
                    <div className="flex items-center gap-4 mb-6">
                      {content.instructor.avatarUrl ? (
                        <img
                          src={content.instructor.avatarUrl}
                          alt={content.instructor.name}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow-md"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: content.instructor.avatarGradient || "linear-gradient(135deg, #FF6600, #ff8533)" }}
                        >
                          <span className="text-2xl font-black text-white">
                            {content.instructor.avatarInitial || content.instructor.name[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900">
                          {content.instructor.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {content.instructor.title}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-gray-50 rounded-xl p-5 mb-6">
                      <p className="text-[15px] text-gray-700 leading-relaxed">
                        {content.instructor.bio}
                      </p>
                    </div>

                    {/* 4섹션: 학력 / 경력 / 저서 / 수상 (2x2 그리드) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                      {/* 학력 */}
                      {content.instructor.education && content.instructor.education.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">학력</h4>
                          <div className="space-y-1.5">
                            {content.instructor.education.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                                <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 경력 */}
                      {content.instructor.career && content.instructor.career.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">경력</h4>
                          <div className="space-y-1.5">
                            {content.instructor.career.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                                <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 저서 */}
                      {content.instructor.books && content.instructor.books.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">저서</h4>
                          <div className="space-y-1.5">
                            {content.instructor.books.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                                <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 수상·활동 */}
                      {content.instructor.awards && content.instructor.awards.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">수상 · 활동</h4>
                          <div className="space-y-1.5">
                            {content.instructor.awards.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                                <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 기존 credentials (4섹션이 없는 강의용 fallback) */}
                    {content.instructor.credentials.length > 0 && !content.instructor.education && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Award size={16} className="text-brand" />
                          학력 / 경력
                        </h4>
                        <div className="space-y-2">
                          {content.instructor.credentials.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SNS */}
                    {content.instructor.youtubeUrl && (
                      <a
                        href={content.instructor.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        유튜브 채널 보기
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* ══════════ SECTION: 후기 (reviews) ══════════ */}
            <div
              ref={(el) => { sectionRefs.current.reviews = el; }}
              data-section="reviews"
            >
              <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-brand" />
                    <h2 className="text-lg font-extrabold">
                      베스트 수강 후기
                    </h2>
                    <span className="text-sm text-gray-400 font-medium ml-1">
                      {reviews.length}개
                    </span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Star size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">
                      아직 등록된 후기가 없습니다.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating Summary */}
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-6">
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
                    </div>

                    {/* Review Cards - 2 column grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visibleReviews.map((r) => (
                          <div
                            key={r.id}
                            className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User size={16} className="text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {r.user?.name || "수강생"}
                                </p>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      fill={i <= r.rating ? "#FFB800" : "none"}
                                      stroke="#FFB800"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {r.content && (
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                                {r.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Show more */}
                      {reviews.length > 4 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="w-full mt-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                        >
                          {showAllReviews ? (
                            <>
                              접기 <ChevronUp size={16} />
                            </>
                          ) : (
                            <>
                              더보기 ({reviews.length - 4}개) <ChevronDown size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* ══════════ SECTION: 질문·답변 (qna) ══════════ */}
            <div
              ref={(el) => { sectionRefs.current.qna = el; }}
              data-section="qna"
            >
              <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <MessageCircle size={18} className="text-brand" />
                    질문·답변
                    <span className="text-sm font-medium text-gray-400 ml-1">
                      전체 {qnaQuestions.length}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    강의 관련 궁금한 점을 남겨주세요 :)
                  </p>
                </div>

                {/* QnA Input */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <textarea
                    value={qnaText}
                    onChange={(e) => setQnaText(e.target.value.slice(0, 500))}
                    placeholder={
                      isLoggedIn
                        ? "수강 전 궁금한 점을 질문해보세요."
                        : "로그인 후 질문을 남길 수 있습니다."
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {qnaText.length}/500
                    </span>
                    <button
                      onClick={handleQnaSubmit}
                      disabled={qnaSubmitting || !qnaText.trim()}
                      className="px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {qnaSubmitting ? "등록 중..." : "등록하기"}
                    </button>
                  </div>
                </div>

                {/* QnA List */}
                <div className="divide-y divide-gray-100">
                  {qnaQuestions.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <MessageCircle size={32} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">
                        아직 등록된 질문이 없습니다.
                      </p>
                    </div>
                  )}
                  {qnaQuestions.map((q) => (
                    <div key={q.id} className="px-6 py-5">
                      {/* Question */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {q.user?.avatar_url ? (
                            <img
                              src={q.user.avatar_url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {q.user?.name || "수강생"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(q.created_at).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {q.content}
                          </p>
                        </div>
                      </div>

                      {/* Answers */}
                      {q.answers.length > 0 && (
                        <div className="ml-12 mt-4 space-y-3">
                          {q.answers.map((a) => (
                            <div
                              key={a.id}
                              className="bg-brand-light/50 border border-brand/10 rounded-xl p-4"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold text-white">A</span>
                                </div>
                                <span className="text-sm font-semibold text-brand">
                                  {a.user?.name || "운영팀"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed ml-8 whitespace-pre-wrap">
                                {a.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* CTA (bottom of content) */}
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

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold mb-4">관련 강의</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedCourses.map((rc) => (
                    <Link
                      key={rc.id}
                      href={`/courses/${rc.slug || rc.id}`}
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
            <div className="sticky top-36 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
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

              {/* Countdown Timer */}
              {countdown && content?.schedule && (
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Clock size={14} className="text-brand" />
                    <span className="text-xs font-bold text-brand">수강 신청 마감까지</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-white tabular-nums">{String(countdown.days).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">일</span>
                    </div>
                    <span className="text-xl font-bold text-gray-500 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-white tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">시</span>
                    </div>
                    <span className="text-xl font-bold text-gray-500 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-white tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">분</span>
                    </div>
                    <span className="text-xl font-bold text-gray-500 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-white tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">초</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">개강일 전날 자정 마감</p>
                </div>
              )}

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

              {/* Capacity */}
              {content?.schedule?.capacity && (
                <div className="bg-brand-light rounded-lg p-4">
                  <p className="text-xs font-bold text-brand mb-3 text-center">수강 인원 제한</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">오프라인</p>
                      <p className="text-xl font-extrabold text-gray-900">{content.schedule.capacity.offline}<span className="text-xs font-medium text-gray-400">명</span></p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">온라인</p>
                      <p className="text-xl font-extrabold text-gray-900">{content.schedule.capacity.online}<span className="text-xs font-medium text-gray-400">명</span></p>
                    </div>
                  </div>
                  <p className="text-[10px] text-brand/70 text-center mt-2">선착순 마감</p>
                </div>
              )}

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
                <Shield size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  7일 이내 100% 환불 보장
                </span>
              </div>

              {/* Share */}
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setToastMsg("링크가 복사되었습니다");
                    } catch {
                      setToastMsg("복사에 실패했습니다");
                    }
                  }}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  <Share2 size={16} />
                  공유하기
                </button>
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
                {content?.materials && content.materials.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">제공 자료</span>
                    <span className="font-medium text-gray-900">
                      {content.materials.length}개
                    </span>
                  </div>
                )}
                {content?.schedule && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">강의일</span>
                      <span className="font-medium text-gray-900">
                        {content.schedule.date}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">시간</span>
                      <span className="font-medium text-gray-900">
                        {content.schedule.time}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">강의장</span>
                      <span className="font-medium text-gray-900">
                        온라인 / 오프라인
                      </span>
                    </div>
                    {content.schedule.offline && (
                      <div className="text-xs text-gray-400 text-right -mt-1">
                        ({content.schedule.offline.address.split(',')[0]})
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">녹화본</span>
                      <span className="font-medium text-red-500">
                        미제공
                      </span>
                    </div>
                  </>
                )}
                {content?.requirements && content.requirements.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">준비물</span>
                    <span className="font-medium text-gray-900">
                      {content.requirements.join(', ')}
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
                
            <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center shadow-sm mr-1.5">
              <span className="text-white font-black text-sm">R</span>
            </div>
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

      {/* ═══ CSS Animations ═══ */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
