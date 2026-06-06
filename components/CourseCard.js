import Link from "next/link";
import { CATEGORY_LABEL, CATEGORY_COLOR, formatPrice } from "@/lib/courses";

export default function CourseCard({ course, rank }) {
  const color = CATEGORY_COLOR[course.category] || "#14110f";
  const cta = course.free ? "무료 신청" : "수강 신청";

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(20,17,15,0.3)]"
    >
      {rank && (
        <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[12px] font-black text-white shadow">
          {rank}
        </span>
      )}
      {course.urgent && !rank && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
          마감 임박
        </span>
      )}

      <div
        className="relative flex h-36 items-end p-4"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 55%, ${color}66 100%)`,
        }}
      >
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">
          {course.level}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-bold text-white/90"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            {CATEGORY_LABEL[course.category]}
          </span>
          {course.free && (
            <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-black text-brand">
              무료
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16px] font-extrabold leading-snug text-ink">{course.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          {course.subtitle}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ink-soft/70">
          <span>{course.instructor}</span>
          {course.lessons > 0 && (
            <>
              <span>·</span>
              <span>총 {course.lessons}강</span>
            </>
          )}
        </div>

        {course.enrollCount > 0 && (
          <div className="mt-2 text-[12px] font-semibold" style={{ color }}>
            {course.enrollCount.toLocaleString("ko-KR")}명 수강
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="flex flex-col">
            {course.discountPct ? (
              <>
                <span className="text-[12px] font-bold text-brand">{course.discountPct}% 할인</span>
                <span className="text-[11px] text-ink-soft line-through">
                  {formatPrice(course.originalPrice)}
                </span>
              </>
            ) : null}
            <span className="text-[17px] font-black text-ink">{formatPrice(course.price)}</span>
          </div>
          <span className="rounded-lg bg-cream px-3 py-2 text-[13px] font-bold text-ink transition-colors group-hover:bg-ink group-hover:text-white">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
