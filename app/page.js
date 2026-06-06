import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { COURSES } from "@/lib/courses";

const WHY = [
  {
    title: "교과서 말고 현장 경험",
    body: "셰어하우스 47호점 창업, 전국 100개 센터 오픈 총괄, 호스텔·스터디카페 직영 운영. 실제로 해본 사람이 직접 가르칩니다. 이론은 현장에서 검증되어야 의미가 있습니다.",
  },
  {
    title: "배운 것을 바로 쓸 수 있는 구조",
    body: "강의는 현장에서 당장 적용할 수 있는 체크리스트·계산법·판단 기준 중심으로 구성합니다. 듣고 끝이 아니라, 내일 실행할 수 있는 것을 가져갑니다.",
  },
  {
    title: "강의 후 전문가와 바로 연결",
    body: "강의로 신뢰가 생기면, 직접 컨설팅과 서비스를 의뢰할 수 있습니다. 교육이 끝이 아니라 전문가와의 연결이 시작되는 플랫폼입니다.",
  },
];

const STEPS = [
  { n: "01", t: "강의 등록", d: "전문가가 자신의 노하우를 온라인 강의로 등록합니다. 플랫폼이 기획과 제작을 지원합니다." },
  { n: "02", t: "고객 확보", d: "플랫폼의 마케팅과 카테고리 노출로 고객이 유입됩니다. 교육으로 신뢰를 쌓습니다." },
  { n: "03", t: "의뢰 연결", d: "수업에 만족한 고객이 전문가에게 직접 컨설팅·서비스를 의뢰합니다." },
  { n: "04", t: "수익 창출", d: "강의 수익 + 의뢰 수수료를 통해 지속적으로 수익을 만들어냅니다." },
];

const REVIEWS = [
  {
    name: "이○○",
    role: "공인중개사",
    course: "중개 심화 — 이기는 중개",
    rating: 5,
    text: "3년 경력인데 매출이 정체됐었어요. 특강 듣고 소유주 접근 방식을 바꿨더니 전속 매물이 눈에 띄게 늘었습니다. 직접 해본 사람이 가르쳐주는 게 이렇게 다르구나 싶었어요.",
  },
  {
    name: "정○○",
    role: "소규모 건물 임대인",
    course: "공실 해결 실전 마스터",
    rating: 5,
    text: "1년 넘게 공실이던 상가를 강의 듣고 2개월 만에 채웠습니다. 공실 원인 진단 프레임이 특히 도움이 됐어요. 어디서 막혔는지 보이니까 해결책도 찾기 쉬웠습니다.",
  },
  {
    name: "최○○",
    role: "컨설팅 업종 대표",
    course: "AI자동화 입문 무료특강",
    rating: 5,
    text: "개발자가 아니어도 충분히 따라갈 수 있었습니다. 무료 도구로 이렇게까지 된다는 게 놀라웠어요. 강의 듣고 일주일 만에 문서 작업 시간이 절반으로 줄었습니다.",
  },
];

const FAQ = [
  { q: "강의는 어떻게 결제하나요?", a: "강의 상세 페이지에서 신청하기를 누르고 주문자 정보를 입력하면, 입금 계좌가 안내됩니다. 안내된 계좌로 입금(계좌이체)하시면 확인 후 수강 안내를 보내드립니다." },
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
                유료 강의 결제는 계좌이체(무통장입금)로 진행합니다.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
              <div className="text-[15px] font-bold">김동찬 대표</div>
              <div className="text-[13px] text-white/60">리바운드 그룹 CEO · KAIST MBA</div>
              <dl className="mt-2 grid grid-cols-3 gap-3 text-center">
                {[
                  ["100+", "센터 오픈"],
                  ["5권", "실무 도서"],
                  ["2.8만+", "유튜브 구독"],
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

        {/* REVIEWS */}
        <section className="bg-paper py-20">
          <div className="container-edu">
            <span className="text-[13px] font-bold uppercase tracking-widest text-brand">Reviews</span>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">수강생 후기</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {REVIEWS.map((r, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-line bg-cream/50 p-7">
                  <div className="flex gap-0.5 text-brand">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <span key={j} className="text-[16px]">★</span>
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink">{r.text}</p>
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-[13px] font-semibold text-ink">{r.name}</p>
                    {r.role && <p className="text-[12px] text-ink-soft/70">{r.role}</p>}
                    <p className="mt-0.5 text-[12px] text-ink-soft">{r.course} 수강</p>
                  </div>
                </div>
              ))}
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
