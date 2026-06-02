import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { COURSES } from "@/lib/courses";

const WHY = [
  {
    title: "전문성을 교육으로 판매",
    body: "현장에서 검증된 전문가의 노하우와 경험을 온라인 강의로 제작하여 판매합니다. 기획부터 촬영, 편집, 마케팅까지 플랫폼이 지원합니다.",
  },
  {
    title: "수강에서 의뢰까지 연결",
    body: "고객은 강의를 듣고 끝이 아닙니다. 전문가에게 직접 컨설팅과 서비스를 의뢰할 수 있어, 교육이 곧 비즈니스로 이어집니다.",
  },
  {
    title: "공정한 수익 쉐어 모델",
    body: "강의 수익은 물론, 의뢰 연결 시 발생하는 수수료를 전문가와 플랫폼이 공정하게 나눕니다. 더 많은 가치를 만들수록 더 많이 돌아옵니다.",
  },
];

const STEPS = [
  { n: "01", t: "강의 등록", d: "전문가가 자신의 노하우를 온라인 강의로 등록합니다. 플랫폼이 기획과 제작을 지원합니다." },
  { n: "02", t: "고객 확보", d: "플랫폼의 마케팅과 카테고리 노출로 고객이 유입됩니다. 교육으로 신뢰를 쌓습니다." },
  { n: "03", t: "의뢰 연결", d: "수업에 만족한 고객이 전문가에게 직접 컨설팅·서비스를 의뢰합니다." },
  { n: "04", t: "수익 창출", d: "강의 수익 + 의뢰 수수료를 통해 지속적으로 수익을 만들어냅니다." },
];

const FAQ = [
  { q: "강의는 어떻게 결제하나요?", a: "강의 상세 페이지에서 결제하기를 누르면 Cafe24 안전결제로 이동합니다. 카드·간편결제 등을 지원합니다." },
  { q: "환불이 가능한가요?", a: "수강 시작 전 또는 콘텐츠 미열람 시 환불정책에 따라 환불됩니다. 자세한 기준은 환불정책 페이지를 확인해 주세요." },
  { q: "강사로 참여하고 싶어요.", a: "현장 전문가라면 누구나 강의를 등록할 수 있습니다. 기획·촬영·편집·마케팅을 플랫폼이 지원합니다. 문의 주시면 안내드립니다." },
  { q: "강의를 들은 뒤 컨설팅을 의뢰할 수 있나요?", a: "네. 수업 후 전문가에게 직접 컨설팅·서비스를 의뢰할 수 있습니다. 교육이 곧 비즈니스로 이어집니다." },
];

export default function Home() {
  const featured = COURSES.filter((c) => c.lessons > 0).slice(0, 6);

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-ink text-white">
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #e63329, transparent 70%)" }}
          />
          <div className="container-edu relative grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <div>
              <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold text-white/80">
                부동산·공간사업 전문가 교육 플랫폼
              </span>
              <h1 className="mt-5 text-[34px] font-black leading-[1.2] sm:text-[46px]">
                현장 전문가가 직접 가르치는<br />
                <span className="text-brand">부동산 실전 교육</span>
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/75">
                중개업 · 숙박업 · 투자개발 · AI자동화 · 공실해결. 100개+ 센터 오픈을 총괄한
                현직 CEO가 8년간의 현장 노하우를 강의로 공개합니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/courses" className="rounded-xl bg-brand px-6 py-3.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5">
                  강의 둘러보고 결제하기
                </Link>
                <Link href="/login" className="rounded-xl bg-white/10 px-6 py-3.5 text-[15px] font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15">
                  Google로 3초 가입
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-white/45">
                유료 강의 결제는 Cafe24 안전결제로 진행합니다.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
              <div className="text-[15px] font-bold">김동찬 대표</div>
              <div className="text-[13px] text-white/60">리바운드 그룹 CEO · KAIST MBA</div>
              <dl className="mt-2 grid grid-cols-3 gap-3 text-center">
                {[
                  ["100+", "센터 오픈"],
                  ["5권", "실무 도서"],
                  ["2만+", "유튜브 구독"],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-white/5 py-4">
                    <div className="text-[22px] font-black text-brand">{n}</div>
                    <div className="mt-1 text-[11px] text-white/55">{l}</div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="bg-paper py-20">
          <div className="container-edu">
            <span className="text-[13px] font-bold uppercase tracking-widest text-brand">Why Rebound Edu</span>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">
              단순한 교육이 아닌, 비즈니스 플랫폼
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {WHY.map((w, i) => (
                <div key={i} className="rounded-2xl border border-line bg-cream/50 p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-[16px] font-black text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-[18px] font-extrabold text-ink">{w.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{w.body}</p>
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
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl border border-line bg-paper p-6">
                  <div className="text-[26px] font-black text-brand/30">{s.n}</div>
                  <h3 className="mt-2 text-[16px] font-extrabold text-ink">{s.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
            <p className="mt-3 text-[15px] text-white/70">강의를 둘러보고 Cafe24 안전결제로 바로 시작할 수 있습니다.</p>
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
