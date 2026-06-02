import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalShell({ title, updated, children }) {
  return (
    <>
      <Header />
      <main className="bg-cream/30">
        <div className="container-edu max-w-3xl py-14">
          <h1 className="text-[28px] font-black text-ink sm:text-[32px]">{title}</h1>
          {updated && <p className="mt-2 text-[13px] text-ink-soft">시행일: {updated}</p>}
          <div className="legal mt-8 space-y-6 text-[14px] leading-relaxed text-ink-soft">
            {children}
          </div>
          <p className="mt-12 rounded-xl border border-line bg-paper p-4 text-[12px] text-ink-soft/80">
            * 본 문서는 표준 골격이며, 정식 시행 전 법무 검토 후 확정됩니다.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Article({ heading, children }) {
  return (
    <section>
      <h2 className="text-[16px] font-extrabold text-ink">{heading}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
