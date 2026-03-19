"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/types";
import { formatPrice, formatDuration } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { Star, Clock, BookOpen, PlayCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import type { PaymentPrepareResponse } from "@/types";
import * as PortOne from "@portone/browser-sdk/v2";

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
  kakao_chat_url: string | null;
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

const DIFF_LABELS: Record<string, string> = { beginner: "입문", intermediate: "중급", advanced: "고급" };

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCurriculum, setShowCurriculum] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Course
      const { data: c } = await supabase
        .from("courses")
        .select(`*, kakao_chat_url, instructor:users!courses_instructor_id_fkey(id, name, avatar_url)`)
        .eq("id", id)
        .single();

      if (!c) { router.push("/student/explore"); return; }
      setCourse({
        ...c,
        instructor: Array.isArray(c.instructor) ? c.instructor[0] : c.instructor,
      });

      // Lectures
      const { data: lecs } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", id)
        .order("order_num");
      setLectures(lecs || []);

      // Reviews
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
        setAvgRating(revList.reduce((s, r) => s + r.rating, 0) / revList.length);
      }

      // Check enrollment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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

  const handleEnroll = async () => {
    setEnrolling(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    try {
      // 1. 서버에 결제 준비 요청
      const prepareRes = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const prepareData: PaymentPrepareResponse = await prepareRes.json();

      if (!prepareRes.ok) {
        alert(prepareData.error || "결제 준비에 실패했습니다.");
        setEnrolling(false);
        return;
      }

      // 2. 무료 강의인 경우 바로 등록 완료
      if (prepareData.free) {
        setEnrolled(true);
        setEnrolling(false);
        return;
      }

      // 3. 유료 강의: PortOne 결제창 호출
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        alert("결제 시스템이 설정되지 않았습니다. 관리자에게 문의해주세요.");
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

      // 4. 결제 결과 확인
      if (response?.code != null) {
        // 사용자가 결제를 취소하거나 오류 발생
        if (response.code !== "FAILURE_TYPE_PG" && response.code !== "PAY_PROCESS_CANCELED") {
          alert(response.message || "결제가 취소되었습니다.");
        }
        setEnrolling(false);
        return;
      }

      // 5. 서버에 결제 완료 검증 요청
      const completeRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: prepareData.paymentId }),
      });
      const completeData = await completeRes.json();

      if (completeRes.ok && completeData.success) {
        setEnrolled(true);
        alert("결제가 완료되었습니다! 수강을 시작하세요.");
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
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  // Group lectures by section
  const sections: { title: string; lectures: Lecture[] }[] = [];
  lectures.forEach((l) => {
    const sectionTitle = l.section_title || "커리큘럼";
    const existing = sections.find((s) => s.title === sectionTitle);
    if (existing) existing.lectures.push(l);
    else sections.push({ title: sectionTitle, lectures: [l] });
  });

  const discountPct = course.discount_price
    ? Math.round((1 - course.discount_price / course.price) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <Badge color="blue">{CATEGORY_LABELS[course.category] || course.category}</Badge>
          {course.difficulty && (
            <Badge color="gray">{DIFF_LABELS[course.difficulty] || course.difficulty}</Badge>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h1>
        {course.subtitle && (
          <p className="text-sm text-gray-500 mb-4">{course.subtitle}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{course.instructor?.name}</span>
          <span className="flex items-center gap-1">
            <BookOpen size={14} /> {course.total_lectures}강
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {formatDuration(course.total_duration_sec)}
          </span>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1">
              <Star size={14} fill="#FFB800" stroke="#FFB800" />
              {avgRating.toFixed(1)} ({reviews.length})
            </span>
          )}
        </div>

        {/* Price + Enroll */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            {discountPct > 0 && (
              <>
                <span className="text-lg font-bold text-red-500">{discountPct}%</span>
                <span className="text-sm text-gray-400 line-through">
                  ₩{formatPrice(course.price)}
                </span>
              </>
            )}
            <span className="text-2xl font-bold text-gray-900">
              ₩{formatPrice(course.discount_price || course.price)}
            </span>
          </div>
          {enrolled ? (
            <div className="flex items-center gap-2">
              {course.kakao_chat_url && (
                <a
                  href={course.kakao_chat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#FEE500] text-[#391B1B] font-semibold text-sm hover:bg-[#F5DD00] transition"
                >
                  <MessageCircle size={16} />
                  수강생 단톡방 입장
                </a>
              )}
              <button
                onClick={() => router.push("/student")}
                className="px-6 py-2.5 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition"
              >
                내 강의실로 이동
              </button>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-2.5 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition disabled:opacity-50"
            >
              {enrolling
                ? "처리 중..."
                : (course.discount_price || course.price) === 0
                  ? "무료 수강 신청"
                  : `수강 신청 · ₩${formatPrice(course.discount_price || course.price)}`}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-3">강의 소개</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {course.description}
          </p>
        </div>
      )}

      {/* Curriculum */}
      {lectures.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <button
            onClick={() => setShowCurriculum(!showCurriculum)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-base font-bold">
              커리큘럼 ({lectures.length}강)
            </h2>
            {showCurriculum ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showCurriculum && (
            <div className="mt-4 space-y-4">
              {sections.map((section) => (
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
                          <PlayCircle size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{l.title}</span>
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
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4">
            수강 후기 ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
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
                  <span className="text-xs text-gray-500">{r.user?.name || "수강생"}</span>
                </div>
                {r.content && (
                  <p className="text-sm text-gray-600">{r.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
