import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getCourseContent } from "@/data/course-details";

// Use direct Supabase client (not SSR) for metadata generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;

  // slug or UUID lookup
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  const { data: course } = await supabase
    .from("courses")
    .select(
      `id, title, subtitle, description, price, discount_price, category, slug,
       instructor:users!courses_instructor_id_fkey(name)`
    )
    .eq(isUuid ? "id" : "slug", id)
    .single();

  if (!course) {
    return {
      title: "강의를 찾을 수 없습니다 | 리바운드에듀",
    };
  }

  const content = getCourseContent(id);
  const instructorName = Array.isArray(course.instructor)
    ? (course.instructor[0] as any)?.name
    : (course.instructor as any)?.name;
  const displayPrice =
    (course.discount_price || course.price) === 0
      ? "무료"
      : `₩${(course.discount_price || course.price).toLocaleString()}`;

  const title = `${course.title} | 리바운드에듀`;
  const description =
    course.subtitle ||
    course.description ||
    `${instructorName} 강사의 실전 강의. ${displayPrice}`;

  const siteUrl = "https://edu.rebound.io.kr";
  const courseUrl = `${siteUrl}/courses/${course.slug || course.id}`;
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(course.title)}&instructor=${encodeURIComponent(instructorName || "")}&price=${encodeURIComponent(displayPrice)}&category=${encodeURIComponent(course.category || "")}`;

  return {
    title,
    description,
    openGraph: {
      title: course.title,
      description: description || undefined,
      url: courseUrl,
      siteName: "리바운드에듀",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: description || undefined,
      images: [ogImageUrl],
    },
    other: {
      "og:price:amount": String(course.discount_price || course.price),
      "og:price:currency": "KRW",
    },
  };
}

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
