import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  const isFree = course?.free || course?.price === 0;
  return { title: course ? `${isFree ? "무료 신청" : "수강 신청"} · ${course.title}` : "수강 신청" };
}

export default async function CheckoutPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const course = getCourse(id);
  if (!course) notFound();
  if (course.redirectTo) {
    const scheduleQuery = id === "hostel-live-thu" ? "?schedule=wed" : "";
    redirect(`${course.redirectTo.replace("/courses/", "/checkout/")}${scheduleQuery}`);
  }
  const selectedScheduleOption =
    course.scheduleOptions?.find((option) => option.id === query?.schedule) ||
    course.scheduleOptions?.find((option) => option.id === "sat") ||
    course.scheduleOptions?.[0] ||
    null;
  const backCourseId = course.parentCourseId || course.id;
  const title = course.checkoutTitle || course.title;
  const displayTitle = selectedScheduleOption ? `${title} · ${selectedScheduleOption.label}` : title;
  const displaySchedule = selectedScheduleOption
    ? `${selectedScheduleOption.schedule} · ${selectedScheduleOption.place}`
    : course.place
      ? `${course.schedule} · ${course.place}`
      : course.schedule;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu py-12">
          <Link href={`/courses/${backCourseId}`} className="text-[13px] font-semibold text-ink-soft hover:text-ink">
            ← 강의 상세로
          </Link>
          <h1 className="mt-3 text-[28px] font-black text-ink sm:text-[34px]">
            {course.free || course.price === 0 ? "무료 신청" : "수강 신청 (계좌이체)"}
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            {course.free || course.price === 0
              ? "신청 정보를 입력하고 무료로 신청하세요."
              : "신청 정보를 입력하면 입금 계좌를 안내해 드립니다."}
          </p>
          <div className="mt-5 rounded-2xl border border-line bg-paper p-5">
            <p className="text-[15px] font-black text-ink">{displayTitle}</p>
            {displaySchedule && (
              <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">
                {displaySchedule}
              </p>
            )}
          </div>

          <div className="mt-9">
            <CheckoutForm course={course} selectedScheduleOption={selectedScheduleOption} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
