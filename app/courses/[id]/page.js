import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseShareButton from "@/components/CourseShareButton";
import ScheduleCheckoutSelector from "@/components/ScheduleCheckoutSelector";
import VideoReviewGrid from "@/components/VideoReviewGrid";
import {
  COURSES,
  KDC_BIO,
  getCourse,
  formatPrice,
  CATEGORY_COLOR,
  getCourseDeliveryLabel,
  getCourseEnrollmentStatus,
} from "@/lib/courses";
import { getInstructor } from "@/lib/instructors";
import { COMPANY } from "@/lib/company";
import { getCourseInquiryUrl } from "@/lib/courseGuidance";

export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) return { title: "강의를 찾을 수 없습니다" };
  const title = `${course.title} | 리바운드 에듀`;
  const description = course.tagline || course.subtitle || course.summary?.slice(0, 150);
  const image = course.ogImage || `/courses/assets/course-pages/${course.id}.png`;
  const url = `/courses/${course.redirectTo ? course.redirectTo.split("/").pop() : course.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "리바운드에듀",
      locale: "ko_KR",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${course.title} 대표 이미지` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── 수업별 FAQ 생성 ──────────────────────────────────────
function buildFaq(course) {
  const faqs = [];

  if (course.faq?.length) {
    faqs.push(...course.faq);
  }

  if (course.live && course.delivery === "오프라인" && !course.faq?.length) {
    faqs.push({
      q: "수업 장소는 어디인가요?",
      a: course.place
        ? `${course.place}에서 진행됩니다. 상세 일정과 임장 안내는 수업 안내 페이지를 확인해 주시기 바랍니다.`
        : "강남(리바운드 역삼점), 강북(리바운드 종로점), 온라인 구글미트 등 수업에 따라 상이하니 수업 안내 페이지를 확인해 주시기 바랍니다.",
    });
  }
  if (course.live && course.delivery === "온라인") {
    faqs.push({
      q: "온라인 수업 링크는 어떻게 받나요?",
      a: "입금 확인 후 수업 전날 또는 당일 오전 중 카카오톡 또는 이메일로 Zoom 링크를 발송드립니다.",
    });
  }
  if (course.guarantee && !course.faq?.length) {
    faqs.push({
      q: `'${course.guarantee}'이 정확히 어떤 의미인가요?`,
      a: "수업 시간 내에 설정·구현이 완료되지 않으면, 수업 후 강사가 직접 원격으로 완성해드립니다. 도구·계정 문제나 인터넷 환경 문제는 제외됩니다.",
    });
  }
  if (course.bonus && course.bonus.some((b) => b.includes("매물"))) {
    faqs.push({
      q: "수업 후 제공되는 매물 정보는 어떻게 받나요?",
      a: "수업 당일 카카오톡 오픈채팅방 또는 단체 채팅에 초대해드립니다. 매입·임차 대상 매물이 확인될 때마다 공유됩니다.",
    });
  }
  if (course.priceMonthly) {
    faqs.push({
      q: "낱개 수강과 월 묶음 수강의 차이는 무엇인가요?",
      a: `1회 ${formatPrice(course.price)}로 원하는 주만 선택 수강하거나, 한 달 4회를 ${formatPrice(course.priceMonthly)}에 묶음으로 결제할 수 있습니다. 묶음 결제는 해당 월에만 유효합니다.`,
    });
  }
  if (course.bonus && course.bonus.some((b) => b.includes("채용"))) {
    faqs.push({
      q: "채용 기회는 어떤 기준으로 제공되나요?",
      a: "수강 기간 중 성실도, 과제 제출, 참여도를 종합적으로 평가합니다. 우수 수강생에게는 리바운드 그룹 소속 중개법인 입사 제안을 드립니다.",
    });
  }

  // 공통 FAQ
  faqs.push({
    q: "결제는 어떻게 하나요?",
    a: "신청서 제출 후 안내되는 계좌로 무통장입금(계좌이체) 하시면 됩니다. 계좌이체 후 이체 확인 버튼을 클릭하시면 실시간 이체 확인이 됩니다.",
  });
  faqs.push({
    q: "현금영수증, 세금계산서 발급 되나요?",
    a: "네, 가능합니다. 이체 직후 현금영수증 혹은 세금계산서 발급 정보 팝업을 입력해 주시면 됩니다.",
  });
  faqs.push({
    q: "환불 정책이 어떻게 되나요?",
    a: "환불은 환불정책을 따릅니다. 오프라인 특강은 수강일 7일 전 이상 전액·3~6일 전 70%·1~2일 전 50%·수강 당일·미출석은 환불 불가이며, 온라인 콘텐츠는 최초 열람 전 전액 환불입니다. 자세한 내용은 환불정책 페이지를 확인해 주세요.",
  });

  return faqs;
}

// ── 신청 방법 단계 ──────────────────────────────────────
function getRegisterSteps(course) {
  if (course.delivery === "온라인") {
    return [
      { n: "01", t: "수강 신청", d: "상세 페이지에서 수강 신청하고 이름·연락처를 입력합니다." },
      { n: "02", t: "결제(실시간 계좌이체)", d: `안내된 계좌로 ${course.priceLabel || formatPrice(course.price)} 이체 후 입금 확인 버튼을 클릭합니다.` },
      { n: "03", t: "안내 메시지 확인", d: "수업 전날 또는 당일 오전 온라인 수강 링크를 안내드립니다." },
    ];
  }
  if (course.format === "1:1 과정") {
    return [
      { n: "01", t: "수강 신청", d: "상세 페이지에서 신청하고 연락처를 남겨주세요." },
      { n: "02", t: "결제(실시간 계좌이체)", d: `안내된 계좌로 ${formatPrice(course.price)} 이체 후 입금 확인 버튼을 클릭합니다.` },
      { n: "03", t: "안내 메시지 확인", d: "강사와 1:1 일정 및 진행 방식을 안내드립니다." },
    ];
  }
  return [
    { n: "01", t: "수강 신청", d: "상세 페이지에서 수강 신청하고 이름·연락처를 입력합니다." },
    { n: "02", t: "결제(실시간 계좌이체)", d: `안내된 계좌로 ${course.priceLabel || formatPrice(course.price)} 이체 후 입금 확인 버튼을 클릭합니다.` },
    { n: "03", t: "안내 메시지 확인", d: "입금 확인 후 수업 장소와 준비물을 안내드립니다." },
  ];
}

function getCoursePlaceLabel(course) {
  if (course.place) return course.place;
  if (course.delivery === "온라인") return "Zoom 온라인";
  if (course.delivery === "온라인+오프라인") return "온라인+현장";
  if (course.delivery === "오프라인") return "리바운드 강의실";
  return "";
}

function getCourseScheduleWithDuration(course) {
  if (!course.schedule) return "";
  if (!course.duration) return course.schedule;
  return `${course.schedule} (${course.duration})`;
}

function ScheduleInfoCards({ course, color }) {
  if (!course.scheduleOptions?.length) return null;

  return (
    <div className="rounded-2xl border border-line bg-paper p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-ink">요일·장소 안내</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            수업과 임장은 모두 리바운드 종로점 기준으로 진행됩니다.
          </p>
        </div>
        <span className="text-[13px] font-bold text-ink-soft">정원 3명~20명</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {course.scheduleOptions.map((option) => (
          <div key={option.id} className="rounded-xl border border-line bg-cream/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[18px] font-black text-ink">{option.label}</p>
                <p className="mt-1 text-[13px] font-semibold text-ink-soft">{option.note}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-[12px] font-black text-white"
                style={{ background: color }}
              >
                {option.weekday}
              </span>
            </div>
            <dl className="mt-5 space-y-2.5 text-[13px]">
              {[
                ["수업", option.schedule],
                ["장소", option.place],
                ["인원", option.capacity],
                ["임장", option.fieldwork],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-ink-soft">{label}</dt>
                  <dd className="text-right font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {course.scheduleNotes?.length > 0 && (
        <div className="mt-5 rounded-xl border border-line bg-paper p-4">
          <p className="text-[13px] font-extrabold text-ink">운영 안내</p>
          <ul className="mt-2 space-y-1.5">
            {course.scheduleNotes.map((note) => (
              <li key={note} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default async function CourseDetail({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) notFound();
  if (course.redirectTo) redirect(course.redirectTo);

  const color = CATEGORY_COLOR[course.category] || "#14110f";
  const totalLessons = course.curriculum.reduce((n, s) => n + s.items.length, 0);
  const instructor = getInstructor(course.instructor);
  const faqs = buildFaq(course);
  const steps = course.live ? getRegisterSteps(course) : null;
  const enrollmentStatus = getCourseEnrollmentStatus(course);
  const deliveryLabel = getCourseDeliveryLabel(course);
  const placeLabel = getCoursePlaceLabel(course);
  const scheduleWithDuration = getCourseScheduleWithDuration(course);
  const inquiryUrl = getCourseInquiryUrl(course);
  const hasInstructorTrust =
    course.instructorOneLiner &&
    course.instructorWhy &&
    course.instructorMatch &&
    course.trustBadges;
  const primaryInstructorVideo = course.instructorVideos?.find((video) => video.primary);
  const secondaryInstructorVideos = course.instructorVideos?.filter((video) => !video.primary) || [];
  const hasInstructorPhotos = course.instructorPhotos && course.instructorPhotos.length > 0;
  const DELIVERY_ICON = { 오프라인: "📍", 온라인: "💻", "온라인+오프라인": "📍" };

  return (
    <>
      <Header />
      <main className="bg-cream/40 pb-24 lg:pb-0">

        {/* ── HERO ──────────────────────────────────────── */}
        <section
          className="relative overflow-hidden text-white"
          style={{ backgroundColor: color }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${color}fa 0%, ${color}e8 46%, ${color}70 100%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.28),transparent_30%),linear-gradient(180deg,rgba(20,17,15,0.08),rgba(20,17,15,0.34))]" />
          {/* 배경 패턴 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle,#fff,transparent 70%)` }} />

          <div className="container-edu relative py-14 sm:py-16 lg:py-20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link href="/courses" className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/70 hover:text-white">
                ← 강의 목록
              </Link>
              <CourseShareButton title={course.title} summary={course.subtitle || course.summary} variant="dark" />
            </div>

            {/* 배지 행 */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-black" style={{ color }}>
                {enrollmentStatus}
              </span>
              {deliveryLabel && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold text-white ring-1 ring-white/25">
                  {deliveryLabel}
                </span>
              )}
              {course.guarantee && (
                <span className="rounded-full bg-green-400/90 px-3 py-1 text-[12px] font-black text-green-900">
                  ✅ {course.guarantee}{course.guaranteeNote ? " · 조건 있음" : ""}
                </span>
              )}
            </div>
            {course.guaranteeNote && (
              <p className="mt-2 max-w-2xl text-[12px] font-semibold leading-relaxed text-white/78">
                {course.guaranteeNote} · <a href="#faq-refund" className="underline underline-offset-2 hover:text-white">조건 자세히 보기</a>
              </p>
            )}

            <h1 className="mt-5 max-w-3xl text-[30px] font-black leading-tight drop-shadow-[0_3px_18px_rgba(0,0,0,0.18)] sm:text-[42px]">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.18)]">
              {course.subtitle}
            </p>

            {/* 핵심 정보 칩 */}
            {(scheduleWithDuration || placeLabel) && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {scheduleWithDuration && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/20">
                    🗓 {scheduleWithDuration}
                  </div>
                )}
                {placeLabel && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/20">
                    {DELIVERY_ICON[course.delivery] || "📍"} {placeLabel}
                  </div>
                )}
              </div>
            )}

            {/* 보너스 */}
            {course.bonus && course.bonus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {course.bonus.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[12px] text-white/90">
                    <span className="font-black text-white">+</span>
                    {b}
                  </div>
                ))}
              </div>
            )}

            {/* 강사 */}
            {instructor && (
              <div className="mt-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/18 bg-white/10 p-3 text-white shadow-[0_16px_36px_-26px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                {instructor.photo ? (
                  <img
                    src={instructor.photo}
                    alt={`${instructor.name} 강사 프로필`}
                    className="h-14 w-14 shrink-0 rounded-full border-2 border-white/45 object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/35 bg-white/20 text-[18px] font-black text-white">
                    {instructor.initial || instructor.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-[15px] font-black leading-tight text-white">{instructor.name}</p>
                    <p className="text-[12px] font-semibold leading-tight text-white/78">{instructor.title}</p>
                  </div>
                  {instructor.affiliation && (
                    <p className="mt-1 text-[12px] font-semibold leading-snug text-white/70">{instructor.affiliation}</p>
                  )}
                  {instructor.specialties && instructor.specialties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {instructor.specialties.slice(0, 3).map((specialty) => (
                        <span key={specialty} className="rounded-full bg-white/16 px-2 py-0.5 text-[11px] font-bold text-white/82">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── BODY ──────────────────────────────────────── */}
        <section className="container-edu grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">

            {/* ▸ 수업 소개 */}
            <div className="rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">수업 소개</h2>
              <p className="mt-3 text-[15px] leading-[1.85] text-ink-soft">{course.summary}</p>
            </div>

            {/* ▸ 이런 걸 배웁니다 */}
            <div className="rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">이런 걸 배웁니다</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {course.highlights.map((h, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-line bg-cream/40 p-4">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ background: color }}
                    >
                      ✓
                    </span>
                    <span className="text-[14px] leading-relaxed text-ink">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <ScheduleInfoCards course={course} color={color} />

            {/* ▸ 라이브 수업 — 다음 수업 일정 하이라이트 */}
            {course.live && course.schedule && !course.scheduleOptions?.length && (
              <div className="overflow-hidden rounded-2xl border-2 bg-paper" style={{ borderColor: color }}>
                <div className="px-7 py-4 text-white" style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-white/70">다음 수업 일정</p>
                  <p className="mt-1 text-[20px] font-black">{course.schedule}</p>
                </div>
                <div className="grid gap-0 divide-x divide-line sm:grid-cols-3">
                  {[
                    { icon: "📍", label: "장소", val: course.delivery === "온라인" ? "Zoom 온라인" : (course.place || "리바운드 강의실") },
                    { icon: "⏱", label: "수업 시간", val: course.duration || "-" },
                    { icon: "💳", label: "수강료", val: course.priceLabel || (course.free ? "무료" : formatPrice(course.price)) },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center justify-center gap-1 p-5 text-center">
                      <span className="text-[22px]">{item.icon}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{item.label}</span>
                      <span className="text-[14px] font-extrabold text-ink">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ▸ 이런 분께 추천합니다 */}
            <div className="rounded-2xl border border-line bg-paper p-7">
              <h2 className="text-[20px] font-extrabold text-ink">이런 분께 추천합니다</h2>
              <div className="mt-5 space-y-2.5">
                {course.target.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-cream/50 px-4 py-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ background: color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed text-ink">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ▸ 이 강의를 누가 가르치나 */}
            {hasInstructorTrust && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[20px] font-extrabold text-ink">이 강의를 누가 가르치나</h2>
                    <p className="mt-2 text-[15px] font-extrabold text-ink">
                      {KDC_BIO.name} <span className="font-semibold text-ink-soft">— {KDC_BIO.role}</span>
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                      15년간 20개가 넘는 공간을 직접 창업·운영·매각하고, 약 280개 AI 에이전트로 6개 법인을 직접 굴리고 있는 사람. 강의에서 말하는 건 다 본인이 지금도 하고 있는 일입니다.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl p-5" style={{ background: `${color}0d` }}>
                  <p className="text-[17px] font-extrabold leading-relaxed text-ink">
                    {course.instructorOneLiner}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-[15px] font-extrabold text-ink">왜 김동찬인가</h3>
                  <ul className="mt-3 space-y-3">
                    {course.instructorWhy.map((reason, i) => (
                      <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                        <span
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                          style={{ background: color }}
                        >
                          {i + 1}
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                  {course.revenueDisclaimer && (
                    <p className="mt-3 text-[12px] font-semibold leading-relaxed text-ink-soft">
                      {course.revenueDisclaimer}
                    </p>
                  )}
                </div>

                <div className="mt-6 hidden overflow-hidden rounded-xl border border-line sm:block">
                  <div className="grid grid-cols-1 bg-cream/70 text-[13px] font-extrabold text-ink sm:grid-cols-2">
                    <div className="border-b border-line px-4 py-3 sm:border-b-0 sm:border-r">이 강좌에서 배우는 것</div>
                    <div className="px-4 py-3">김동찬이 실제로 해온 것</div>
                  </div>
                  <div className="divide-y divide-line">
                    {course.instructorMatch.map((item, i) => (
                      <div key={i} className="grid grid-cols-1 text-[14px] leading-relaxed sm:grid-cols-2">
                        <div className="border-b border-line px-4 py-3 font-semibold text-ink sm:border-b-0 sm:border-r">
                          {item.learn}
                        </div>
                        <div className="px-4 py-3 text-ink-soft">{item.did}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3 sm:hidden">
                  {course.instructorMatch.map((item, i) => (
                    <div key={i} className="rounded-xl border border-line bg-cream/40 p-4">
                      <p className="text-[12px] font-extrabold text-ink-soft">이 강좌에서 배우는 것</p>
                      <p className="mt-1 text-[14px] font-extrabold leading-relaxed text-ink">{item.learn}</p>
                      <p className="mt-4 text-[12px] font-extrabold text-ink-soft">김동찬이 실제로 해온 것</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{item.did}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {course.trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full px-3.5 py-1.5 text-[12px] font-extrabold"
                      style={{ background: `${color}12`, color }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {course.instructorVideos && course.instructorVideos.length > 0 && (
                  <div className="mt-7 border-t border-line pt-6">
                    <h3 className="text-[15px] font-extrabold text-ink">강사가 직접 푼 실전</h3>
                    {primaryInstructorVideo && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-ink">
                        <iframe
                          className="aspect-video w-full"
                          src={`https://www.youtube-nocookie.com/embed/${primaryInstructorVideo.id}`}
                          title={primaryInstructorVideo.title}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {secondaryInstructorVideos.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {secondaryInstructorVideos.map((video) => (
                          <a
                            key={video.id}
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group overflow-hidden rounded-xl border border-line bg-cream/40 transition-colors hover:bg-cream"
                          >
                            <div className="relative aspect-video bg-ink">
                              <img
                                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                alt={`${video.title} 영상 썸네일`}
                                loading="lazy"
                                className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                              />
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="rounded-full bg-paper/95 px-3 py-1 text-[12px] font-black text-ink shadow">
                                  재생
                                </span>
                              </span>
                            </div>
                            <p className="p-3 text-[13px] font-extrabold leading-relaxed text-ink">{video.title}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {hasInstructorPhotos && (
                  <div className="mt-7 border-t border-line pt-6">
                    <h3 className="text-[15px] font-extrabold text-ink">현장 사진</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {course.instructorPhotos.map((photo) => (
                        <figure key={photo.src} className="overflow-hidden rounded-xl border border-line bg-cream/40">
                          <img src={photo.src} alt={photo.alt || ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                          {photo.caption && (
                            <figcaption className="px-3 py-2 text-[12px] font-semibold text-ink-soft">{photo.caption}</figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {!course.scheduleOptions?.length &&
                  (course.cardPaymentUrl ? (
                    <a
                      href={course.cardPaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex rounded-xl px-5 py-3 text-[14px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
                      style={{ background: color, boxShadow: `0 8px 24px -8px ${color}80` }}
                    >
                      카드로 결제하기
                    </a>
                  ) : (
                    <Link
                      href={`/checkout/${course.id}`}
                      className="mt-5 inline-flex rounded-xl px-5 py-3 text-[14px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
                      style={{ background: color, boxShadow: `0 8px 24px -8px ${color}80` }}
                    >
                      {course.free ? "무료 신청하기" : course.enrollAlways ? "지금 신청하기" : "수강 신청하기"}
                    </Link>
                  ))}
              </div>
            )}

            {/* ▸ 숫자로 보는 실적 (사회적 증거) */}
            {course.socialProof && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">{course.socialProof.title || "숫자로 보는 실적"}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {course.socialProof.stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-cream/40 p-5 text-center">
                      <p className="text-[26px] font-black leading-tight" style={{ color }}>{s.value}</p>
                      <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-ink-soft">{s.label}</p>
                    </div>
                  ))}
                </div>
                {course.socialProof.note && (
                  <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">{course.socialProof.note}</p>
                )}
              </div>
            )}

            {/* ▸ 수강생 후기 */}
            {course.studentReviews?.length > 0 && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">수강생 후기</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                  실제 수강생들의 이야기 — 썸네일을 누르면 영상이 열립니다.
                </p>
                <VideoReviewGrid videos={course.studentReviews} color={color} />
              </div>
            )}

            {/* ▸ 커리큘럼 */}
            <div className="rounded-2xl border border-line bg-paper p-7">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[20px] font-extrabold text-ink">커리큘럼</h2>
                <span className="text-[13px] text-ink-soft">
                  {course.curriculum.length}개 섹션 · {totalLessons}개 주제
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {course.curriculum.map((sec, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-line">
                    <div
                      className="flex items-center gap-3 border-b border-line px-5 py-3.5"
                      style={{ background: `${color}0f` }}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[14px] font-bold text-ink">{sec.section}</span>
                    </div>
                    <ul className="divide-y divide-line">
                      {sec.items.map((it, j) => (
                        <li key={j} className="flex items-center gap-3 px-5 py-3 text-[14px] text-ink-soft">
                          <span className="text-[11px] font-bold" style={{ color: `${color}80` }}>
                            {String(j + 1).padStart(2, "0")}
                          </span>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ▸ 수강 후 달라지는 것 */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">수강 후 달라지는 것</h2>
                <div className="mt-5 space-y-3">
                  {course.outcomes.map((o, i) => (
                    <div
                      key={i}
                      className="flex gap-4 rounded-xl p-4"
                      style={{ background: `${color}0d` }}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex items-center text-[14px] leading-relaxed text-ink">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ▸ 신청 방법 */}
            {steps && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">신청 방법</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {steps.map((s) => (
                    <div key={s.n} className="rounded-xl border border-line bg-cream/50 p-5">
                      <div className="text-[26px] font-black" style={{ color: `${color}50` }}>
                        {s.n}
                      </div>
                      <h3 className="mt-2 text-[15px] font-extrabold text-ink">{s.t}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ▸ Q&A */}
            <div className="rounded-2xl border border-line bg-paper p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">수업 관련 Q&A</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                    일정, 장소, 결제, 환불처럼 수강 전에 자주 묻는 내용을 수업별로 정리했습니다.
                  </p>
                </div>
                <a
                  href={inquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl border border-line bg-cream px-4 py-2.5 text-[13px] font-black text-ink transition-colors hover:bg-paper"
                >
                  질문하기
                </a>
              </div>
              <div className="mt-5 divide-y divide-line rounded-xl border border-line">
                {faqs.map((f, i) => {
                  const isRefundFaq = f.q.includes("100% 환급");
                  return (
                  <details key={i} id={isRefundFaq ? "faq-refund" : undefined} className="group scroll-mt-24">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14px] font-bold text-ink">
                      {f.q}
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[16px] font-black text-white transition-transform group-open:rotate-45"
                        style={{ background: color }}
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-[14px] leading-relaxed text-ink-soft">{f.a}</div>
                  </details>
                  );
                })}
              </div>
            </div>

            {/* ▸ 강사 프로필 */}
            {instructor && (
              <div className="rounded-2xl border border-line bg-paper p-7">
                <h2 className="text-[20px] font-extrabold text-ink">강사 소개</h2>
                <div className="mt-5 flex flex-col gap-5 sm:flex-row">
                  {instructor.photo ? (
                    <img
                      src={instructor.photo}
                      alt={`${instructor.name} 강사 프로필`}
                      className="h-24 w-24 shrink-0 rounded-full border border-line object-cover ring-4"
                      style={{ ringColor: `${color}30` }}
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-[28px] font-black text-white ring-4"
                      style={{ background: instructor.color || color, ringColor: `${color}30` }}
                    >
                      {instructor.initial || instructor.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[17px] font-extrabold text-ink">{course.instructorCompactProfile?.name || instructor.name}</p>
                    <p className="mt-0.5 text-[13px] text-ink-soft">{course.instructorCompactProfile?.role || instructor.title}</p>
                    {instructor.affiliation && (
                      <p className="mt-1 text-[13px] font-bold text-ink-soft">{instructor.affiliation}</p>
                    )}
                    {instructor.specialties && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {instructor.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full border border-line bg-cream px-3 py-1 text-[12px] font-bold text-ink-soft"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                    {course.instructorCompactProfile?.tagline && (
                      <p className="mt-3 text-[13px] font-extrabold leading-relaxed text-ink">
                        {course.instructorCompactProfile.tagline}
                      </p>
                    )}
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                      {course.instructorCompactProfile?.bio || instructor.bio}
                    </p>
                  </div>
                </div>
                {course.instructorCompactProfile ? (
                  course.revenueDisclaimer && (
                    <p className="mt-4 text-[12px] font-semibold leading-relaxed text-ink-soft">
                      {course.revenueDisclaimer}
                    </p>
                  )
                ) : instructor.profileSections ? (
                  <>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {instructor.profileSections.map((section) => (
                        <div key={section.title} className="rounded-xl border border-line bg-cream/60 p-4">
                          <h3 className="text-[13px] font-black text-brand">{section.title}</h3>
                          <ul className="mt-3 space-y-1.5">
                            {section.items.map((item) => (
                              <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {course.revenueDisclaimer && (
                      <p className="mt-3 text-[12px] font-semibold leading-relaxed text-ink-soft">
                        {course.revenueDisclaimer}
                      </p>
                    )}
                  </>
                ) : (
                  instructor.credentials && (
                    <ul className="mt-5 space-y-1.5">
                      {instructor.credentials.map((cred, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-ink-soft">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
                          {cred}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>

          {/* ── STICKY SIDEBAR ──────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-[0_18px_40px_-26px_rgba(20,17,15,0.35)]">

              {/* 보증 배지 */}
              {course.guarantee && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-[13px] font-bold text-green-700">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">✅</span>
                    <span>{course.guarantee}{course.guaranteeNote ? " · 조건 있음" : ""}</span>
                  </div>
                  {course.guaranteeNote && (
                    <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-green-800/75">
                      {course.guaranteeNote} · <a href="#faq-refund" className="underline underline-offset-2 hover:text-green-950">조건 자세히 보기</a>
                    </p>
                  )}
                </div>
              )}

              {/* 가격 */}
              {course.discountPct && (
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand px-2 py-0.5 text-[12px] font-black text-white">
                    {course.discountPct}%
                  </span>
                  <span className="text-[13px] text-ink-soft line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                </div>
              )}
              {course.priceLabel ? (
                <div className="text-[22px] font-black text-ink">{course.priceLabel}</div>
              ) : (
                <div className="text-[28px] font-black text-ink">{formatPrice(course.price)}</div>
              )}

              {course.scheduleOptions?.length ? (
                <ScheduleCheckoutSelector options={course.scheduleOptions} color={color} />
              ) : (
                <>
                  {course.cardPaymentUrl && (
                    <a
                      href={course.cardPaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block rounded-xl px-5 py-4 text-center text-[15px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
                      style={{ background: color, boxShadow: `0 8px 24px -8px ${color}80` }}
                    >
                      카드로 결제하기
                    </a>
                  )}
                  <Link
                    href={`/checkout/${course.id}`}
                    className={
                      course.cardPaymentUrl
                        ? "mt-2.5 block rounded-xl border border-line bg-paper px-5 py-4 text-center text-[15px] font-black text-ink transition-transform hover:-translate-y-0.5"
                        : "mt-4 block rounded-xl px-5 py-4 text-center text-[15px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
                    }
                    style={course.cardPaymentUrl ? undefined : { background: color, boxShadow: `0 8px 24px -8px ${color}80` }}
                  >
                    {course.free
                      ? "무료 신청하기"
                      : course.cardPaymentUrl
                        ? "무통장 입금으로 신청"
                        : course.enrollAlways
                          ? "지금 신청하기"
                          : "수강 신청하기"}
                  </Link>
                  <p className="mt-2.5 text-center text-[12px] text-ink-soft/70">
                    {course.free
                      ? "로그인 후 바로 신청됩니다."
                      : course.cardPaymentUrl
                        ? "카드결제는 외부 결제창(리바운드 스토어)으로 연결됩니다. 무통장입금도 선택할 수 있습니다."
                        : "신청 후 입금 계좌가 안내됩니다. (무통장입금)"}
                  </p>
                </>
              )}

              {/* 수업 정보 */}
              <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[13px]">
                {[
                  ["상태", enrollmentStatus],
                  ...(course.schedule ? [["일정", course.scheduleShort || course.schedule]] : []),
                  ...(deliveryLabel ? [["방식", deliveryLabel]] : []),
                  ...(course.format ? [["형태", course.format]] : []),
                  ...(course.duration ? [["시간", course.duration]] : []),
                  ...(!course.schedule && course.lessons > 0 ? [["강의 수", `총 ${course.lessons}강`]] : []),
                  ["강사", course.instructor],
                ].map(([dt, dd]) => (
                  <div key={dt} className="flex justify-between gap-2">
                    <dt className="shrink-0 text-ink-soft">{dt}</dt>
                    <dd className="text-right font-semibold text-ink">{dd}</dd>
                  </div>
                ))}
              </dl>

              {/* 수강 혜택 */}
              {course.bonus && course.bonus.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-ink-soft">수강 혜택</p>
                  <ul className="mt-2 space-y-1.5">
                    {course.bonus.map((b, i) => (
                      <li key={i} className="flex gap-1.5 text-[12px] text-ink-soft">
                        <span className="shrink-0 font-bold" style={{ color }}>+</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 상담 링크 */}
              <a
                href={inquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-cream hover:text-ink"
              >
                카카오톡으로 문의하기
              </a>
              <div className="mt-3 flex justify-center">
                <CourseShareButton title={course.title} summary={course.subtitle || course.summary} color={color} />
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* ── 모바일 하단 고정 CTA ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        {course.scheduleOptions?.length ? (
          <ScheduleCheckoutSelector options={course.scheduleOptions} color={color} compact />
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-extrabold text-ink">{course.title}</p>
              <p className="text-[13px] font-black" style={{ color }}>
                {course.priceLabel || (course.free ? "무료" : formatPrice(course.price))}
              </p>
            </div>
            {course.cardPaymentUrl ? (
              <a
                href={course.cardPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl px-5 py-3 text-[14px] font-black text-white"
                style={{ background: color }}
              >
                카드결제
              </a>
            ) : (
              <Link
                href={`/checkout/${course.id}`}
                className="shrink-0 rounded-xl px-5 py-3 text-[14px] font-black text-white"
                style={{ background: color }}
              >
                {course.free ? "무료 신청" : "신청하기"}
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
