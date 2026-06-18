"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const SLIDES = [
  {
    id: "hostel",
    bg: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #0f766e 100%)",
    tag: "호스텔 올인원 창업과정",
    heading: "호스텔 중개 - 임차 - 매입까지\n직접 다 해본 전문가",
    sub: "목요일·토요일 선택 · 이론 13:00-19:00 · 임장 수업 금요일 17시·토요일 14시",
    cta: { label: "자세히 보기", href: "/courses/hostel-live-sat" },
    accent: "#2563eb",
    schedule: "일정 : 목요일·토요일 13:00-19:00",
    place: "장소 : 실매물 현장 · 리바운드 종로점 · 선배 창업자 호스텔",
  },
  {
    id: "ai-marketing",
    bg: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #db2777 100%)",
    tag: "AI 마케팅 자동화",
    heading: "네이버·인스타·구글\n한 번에 자동화한다",
    sub: "못하면 직접 해드립니다 — 수업 당일 내 채널 세팅 완성",
    cta: { label: "수업 보기", href: "/courses/ai-marketing-auto" },
    accent: "#7c3aed",
    schedule: "매주 월요일 13:00-19:00",
  },
  {
    id: "ai-dev",
    bg: "linear-gradient(135deg, #14110f 0%, #334155 60%, #0f766e 100%)",
    tag: "AI 서비스 개발",
    heading: "개발자 없이\n내 서비스를 만든다",
    sub: "기획·코딩·결제·배포까지 하루 안에 — 못하면 해드림",
    cta: { label: "수업 보기", href: "/courses/ai-service-dev" },
    accent: "#0f766e",
    schedule: "매주 수요일 13:00-19:00",
  },
  {
    id: "brokerage",
    bg: "linear-gradient(135deg, #14110f 0%, #1e3a5f 55%, #0f766e 100%)",
    tag: "중개 실무 교육",
    heading: "현직 CEO가 직접 가르치는\n중개 실무 주간 과정",
    sub: "매주 화요일·금요일 온라인 — 우수 수강생 채용 기회 제공",
    cta: { label: "심화 과정", href: "/courses/brokerage-advanced" },
    cta2: { label: "실무 교육", href: "/courses/brokerage-weekly" },
    accent: "#0f766e",
    schedule: "화/금 오전",
  },
  {
    id: "book",
    bg: "linear-gradient(135deg, #78350f 0%, #b45309 55%, #d97706 100%)",
    tag: "책쓰기 과정",
    heading: "당신의 24시간이\n책이 된다",
    sub: "5권+ 출간 저자 직강 — 기획·집필·출간 전 과정 1:1 완성",
    cta: { label: "과정 보기", href: "/courses/book-publishing" },
    accent: "#b45309",
    schedule: "상시 모집",
  },
];

const INTERVAL = 5000;
const INSTRUCTOR_PROFILE = {
  photo: "/courses/instructor/kdc-profile.jpg",
  name: "김동찬",
  role: "(주)리바운드 대표이사 · 중개법인 대표",
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);
  const goTo = useCallback((i) => setCurrent(i), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: slide.bg, transition: "background 0.7s ease" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(14,24,48,0.9) 0%, rgba(25,65,150,0.62) 48%, rgba(10,74,84,0.2) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_28%,rgba(255,255,255,0.26),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.28))]" />
      {/* 배경 패턴 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.075]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* 오브 */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }}
      />

      <div className="container-edu relative py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            {/* 태그 */}
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/90">
              {slide.tag}
            </span>

            {/* 헤딩 */}
            <h1 className="mt-4 whitespace-pre-line text-[32px] font-black leading-[1.15] drop-shadow-[0_4px_22px_rgba(0,0,0,0.28)] sm:text-[46px]">
              {slide.heading}
            </h1>

            {/* 서브 */}
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/82 drop-shadow-[0_2px_14px_rgba(0,0,0,0.24)]">
              {slide.sub}
            </p>

            {/* 일정 배지 */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white/90">
              <span>🗓</span>
              {slide.schedule}
            </div>
            {slide.place && (
              <div className="mt-2 w-fit rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white/90">
                {slide.place}
              </div>
            )}

            {/* CTA 버튼 */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={slide.cta.href}
                className="rounded-xl bg-white px-6 py-3.5 text-[15px] font-bold text-ink shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
              >
                {slide.cta.label}
              </Link>
              {slide.cta2 && (
                <Link
                  href={slide.cta2.href}
                  className="rounded-xl bg-white/15 px-6 py-3.5 text-[15px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
                >
                  {slide.cta2.label}
                </Link>
              )}
            </div>

            {/* 강사 프로필 */}
            <div className="mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-white/18 bg-white/10 p-4 shadow-[0_18px_44px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div
                role="img"
                aria-label={`${INSTRUCTOR_PROFILE.name} 강사 프로필`}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white/10 bg-no-repeat shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                style={{
                  backgroundImage: `url(${INSTRUCTOR_PROFILE.photo})`,
                  backgroundPosition: "center center",
                  backgroundSize: "112%",
                }}
              />
              <div className="min-w-0">
                <p className="text-[18px] font-black leading-tight text-white">
                  {INSTRUCTOR_PROFILE.name}
                </p>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-white/86">
                  {INSTRUCTOR_PROFILE.role}
                </p>
                {INSTRUCTOR_PROFILE.affiliation && (
                  <p className="mt-1 text-[12px] font-medium text-white/58">
                    {INSTRUCTOR_PROFILE.affiliation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 슬라이드 인덱스 카드 (데스크탑) */}
          <div className="hidden items-center justify-center md:flex">
            <div className="w-full max-w-[280px] space-y-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  className={`w-full rounded-xl px-4 py-3.5 text-left transition-all ${
                    i === current
                      ? "bg-white/20 ring-1 ring-white/40"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className={`text-[13px] font-semibold ${i === current ? "text-white" : "text-white/60"}`}>
                    {s.tag}
                  </p>
                  {i === current && (
                    <p className="mt-0.5 text-[12px] text-white/60">{s.schedule}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 인디케이터 + 이전/다음 */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4">
        <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
          ‹
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
        <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
          ›
        </button>
      </div>
    </section>
  );
}
