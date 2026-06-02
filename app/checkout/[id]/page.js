import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/CheckoutForm";
import { COURSES, getCourse } from "@/lib/courses";

export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  return { title: course ? `결제 · ${course.title}` : "결제" };
}

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu py-12">
          <Link href={`/courses/${course.id}`} className="text-[13px] font-semibold text-ink-soft hover:text-ink">
            ← 강의 상세로
          </Link>
          <h1 className="mt-3 text-[28px] font-black text-ink sm:text-[34px]">결제하기</h1>
          <p className="mt-2 text-[14px] text-ink-soft">주문 정보를 확인하고 결제를 진행해 주세요.</p>

          <div className="mt-9">
            <CheckoutForm course={course} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
