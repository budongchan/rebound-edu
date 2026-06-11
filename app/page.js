import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import HeroSlider from "@/components/HeroSlider";
import { COURSES, MENU_CATEGORIES } from "@/lib/courses";

const WHY = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    image: "/courses/assets/real/kdc-cafe-space.jpg",
    imageAlt: "운영 중인 공간 현장",
    title: "사업가가 부동산의 세계로 들어왔다",
    body: "공간을 거래 대상이 아니라 운영·돈·법무·세금·사람이 결합된 사업 구조로 봅니다. 이론을 외운 사람이 아니라, 직접 만들고 운영하며 문제를 겪어본 사람이 가르칩니다.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    image: "/courses/assets/real/kdc-space-building.jpg",
    imageAlt: "부동산 공간 운영 현장",
    title: "복잡한 현실을 판단 가능한 구조로",
    body: "좋아 보이는 조건보다 나중에 터질 조건을 먼저 봅니다. 해봤을 때 되는가, 계약서에 남길 수 있는가, 세금과 법무에서 버티는가를 기준으로 강의를 설계합니다.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    image: "/courses/assets/real/kdc-lecture-qa.jpg",
    imageAlt: "리바운드 강의 현장",
    title: "질문 하나가 강의·책·서비스가 된다",
    body: "반복 상담은 콘텐츠가 되고, 콘텐츠는 강의가 되고, 강의는 체크리스트와 SaaS로 이어집니다. 리바운드에듀는 배움에서 끝나지 않고 실행과 의뢰로 연결되는 구조입니다.",
  },
];

const STEPS = [
  { n: "01", t: "강의 등록", d: "전문가가 자신의 노하우를 온라인 강의로 등록합니다. 플랫폼이 기획과 제작을 지원합니다.", position: "left-1/2 top-0 -translate-x-1/2" },
  { n: "02", t: "고객 확보", d: "플랫폼의 마케팅과 카테고리 노출로 고객이 유입됩니다. 교육으로 신뢰를 쌓습니다.", position: "right-0 top-1/2 -translate-y-1/2" },
  { n: "03", t: "의뢰 연결", d: "수업에 만족한 고객이 전문가에게 직접 컨설팅·서비스를 의뢰합니다.", position: "bottom-0 left-1/2 -translate-x-1/2" },
  { n: "04", t: "수익 창출", d: "강의 수익 + 의뢰 수수료를 통해 지속적으로 수익을 만들어냅니다.", position: "left-0 top-1/2 -translate-y-1/2" },
];

const FAQ = [
  { q: "강의는 어떻게 결제하나요?", a: "강의 상세 페이지에서 신청하기를 누르고 주문자 정보를 입력하면, 입금 계좌가 안내됩니다. 계좌이체 후 이체 확인 버튼을 클릭하시면 실시간 이체 확인이 됩니다." },
  { q: "현금영수증, 세금계산서 발급 되나요?", a: "네, 가능합니다. 이체 직후 현금영수증 혹은 세금계산서 발급 정보 팝업을 입력해 주시면 됩니다." },
  { q: "환불이 가능한가요?", a: "수강 시작 전 또는 콘텐츠 미열람 시 환불정책에 따라 환불됩니다. 자세한 기준은 환불정책 페이지를 확인해 주세요." },
  { q: "강사로 참여하고 싶어요.", a: "현장 전문가라면 누구나 강의를 등록할 수 있습니다. 기획·촬영·편집·마케팅을 플랫폼이 지원합니다. 문의 주시면 안내드립니다." },
  { q: "강의를 들은 뒤 컨설팅을 의뢰할 수 있나요?", a: "네. 수업 후 전문가에게 직접 컨설팅·서비스를 의뢰할 수 있습니다. 교육이 곧 비즈니스로 이어집니다." },
];

export default function Home() {
  const popular = COURSES.filter((c) => c.popular).slice(0, 3);
  const featured = COURSES.filter((c) => c.lessons > 0).slice(0, 6);

  return (
    <>
      <Header />
      <main>
        {/* HERO SLIDER */}
        <HeroSlider />

        {/* 카테고리 빠른 탐색 */}
        <section className="border-b border-line bg-paper">
          <div className="container-edu flex flex-wrap gap-2 py-4">
            {MENU_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/subjects/${cat.key}`}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ink/30 hover:bg-cream hover:text-ink"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section className="bg-paper py-20">
          <div className="container-edu">
            <span className="text-[13px] font-bold uppercase tracking-widest text-brand">Why Rebound Edu</span>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">
              성공담이 아니라, 실무 판단 기준
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {WHY.map((w, i) => (
                <div key={i} className="group overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_16px_38px_-30px_rgba(20,17,15,0.42)] transition-shadow hover:shadow-md">
                  <div className="relative h-40 overflow-hidden bg-cream">
                    <img
                      src={w.image}
                      alt={w.imageAlt}
                      className="block h-full w-full max-w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/16 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.7)]">
                      {w.icon}
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="text-[18px] font-extrabold leading-snug text-ink">{w.title}</h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-cream py-20">
          <div className="container-edu">
            <span className="text-[13px] font-bold uppercase tracking-widest text-brand">How it works</span>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">전문가의 성장 사이클</h2>
            <p className="mt-3 text-[15px] text-ink-soft">교육에서 시작해 비즈니스로 확장하는 과정</p>
            <div className="relative mt-12 hidden min-h-[560px] lg:block">
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/18" />
              <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand/20" />
              {[
                { mark: "→", className: "right-[344px] top-[196px]" },
                { mark: "↓", className: "right-[514px] bottom-[144px]" },
                { mark: "←", className: "left-[344px] bottom-[196px]" },
                { mark: "↑", className: "left-[514px] top-[144px]" },
              ].map((arrow) => (
                <span
                  key={arrow.mark}
                  className={`absolute flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[16px] font-black text-white shadow-[0_12px_24px_-16px_rgba(20,17,15,0.8)] ${arrow.className}`}
                >
                  {arrow.mark}
                </span>
              ))}
              <div className="absolute left-1/2 top-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-paper text-center shadow-[0_24px_60px_-40px_rgba(20,17,15,0.48)] ring-1 ring-line">
                <p className="text-[13px] font-extrabold uppercase tracking-widest text-brand">Loop</p>
                <p className="mt-2 text-[24px] font-black leading-tight text-ink">교육이<br />비즈니스로</p>
                <p className="mt-2 max-w-[130px] text-[12px] leading-relaxed text-ink-soft">신뢰가 쌓이면 의뢰와 수익이 다시 강의로 돌아옵니다.</p>
              </div>
              {[
                { className: "left-1/2 top-[72px] w-[170px] -translate-x-1/2 border-t border-brand/25" },
                { className: "right-[168px] top-1/2 h-[150px] -translate-y-1/2 border-r border-brand/25" },
                { className: "bottom-[72px] left-1/2 w-[170px] -translate-x-1/2 border-b border-brand/25" },
                { className: "left-[168px] top-1/2 h-[150px] -translate-y-1/2 border-l border-brand/25" },
              ].map((line) => (
                <span key={line.className} className={`pointer-events-none absolute ${line.className}`} />
              ))}
              {STEPS.map((s) => (
                <div key={s.n} className={`absolute w-[300px] rounded-2xl border border-line bg-paper p-6 shadow-[0_22px_48px_-34px_rgba(20,17,15,0.5)] ${s.position}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-[15px] font-black text-white">
                      {s.n}
                    </div>
                    <h3 className="text-[16px] font-extrabold text-ink">{s.t}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-10 space-y-4 lg:hidden">
              <div className="absolute bottom-10 left-5 top-10 w-px bg-brand/18" />
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative flex gap-4 rounded-2xl border border-line bg-paper p-5 shadow-[0_18px_42px_-34px_rgba(20,17,15,0.5)]">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-black text-white">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">{s.t}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.d}</p>
                    {i === STEPS.length - 1 && (
                      <p className="mt-3 text-[12px] font-extrabold text-brand">다시 강의 등록으로 이어지는 반복 사이클</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR COURSES */}
        {popular.length > 0 && (
          <section className="bg-cream py-20">
            <div className="container-edu">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[13px] font-bold uppercase tracking-widest text-brand">Best</span>
                  <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">지금 가장 많이 듣는 강의</h2>
                </div>
                <Link href="/courses" className="hidden text-[14px] font-bold text-ink-soft hover:text-ink sm:block">
                  전체 보기 →
                </Link>
              </div>
              <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {popular.map((c, i) => (
                  <CourseCard key={c.id} course={c} rank={i + 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COURSES */}
        <section className="bg-paper py-20">
          <div className="container-edu">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[13px] font-bold uppercase tracking-widest text-brand">Courses</span>
                <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">전문가의 실전 강의</h2>
              </div>
              <Link href="/courses" className="hidden text-[14px] font-bold text-ink-soft hover:text-ink sm:block">
                전체 보기 →
              </Link>
            </div>
            <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            <div className="mt-9 text-center sm:hidden">
              <Link href="/courses" className="text-[14px] font-bold text-ink">전체 강의 보기 →</Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-cream py-20">
          <div className="container-edu max-w-3xl">
            <span className="text-[13px] font-bold uppercase tracking-widest text-brand">FAQ</span>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">자주 묻는 질문</h2>
            <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-paper">
              {FAQ.map((f, i) => (
                <details key={i} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-bold text-ink">
                    {f.q}
                    <span className="text-brand transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink py-16 text-center text-white">
          <div className="container-edu">
            <h2 className="text-[26px] font-black sm:text-[32px]">지금, 현장의 노하우를 배우세요</h2>
            <p className="mt-3 text-[15px] text-white/70">강의를 둘러보고 계좌이체로 바로 신청할 수 있습니다.</p>
            <Link href="/courses" className="mt-7 inline-block rounded-xl bg-brand px-7 py-3.5 text-[15px] font-bold transition-transform hover:-translate-y-0.5">
              강의 둘러보기
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
