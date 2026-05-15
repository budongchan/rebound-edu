export type Cafe24CourseInput = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
};

const CAFE24_SHOP_URL = (
  process.env.NEXT_PUBLIC_CAFE24_SHOP_URL || "https://reboundws.cafe24.com"
).replace(/\/$/, "");

const DEFAULT_CAFE24_COURSE_URLS: Record<string, string> = {
  // 호스텔 창업 유료 특강 / 호스텔 창업 올인원 2기 과정
  "c0000000-0000-0000-0000-000000000002": `${CAFE24_SHOP_URL}/product/detail.html?product_no=31`,
  "호스텔 창업 유료 특강": `${CAFE24_SHOP_URL}/product/detail.html?product_no=31`,
  "호스텔 창업 올인원": `${CAFE24_SHOP_URL}/product/detail.html?product_no=31`,
};

function getConfiguredCourseUrls() {
  const raw = process.env.NEXT_PUBLIC_CAFE24_COURSE_URLS;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === "string" && value.trim()),
    );
  } catch {
    return {};
  }
}

function appendTracking(url: string, course: Cafe24CourseInput) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "rebound_edu");
    parsed.searchParams.set("utm_medium", "course_cta");
    if (course.id) parsed.searchParams.set("rebound_course_id", course.id);
    if (course.slug) parsed.searchParams.set("rebound_course_slug", course.slug);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getCafe24CourseUrl(course: Cafe24CourseInput) {
  const configured = getConfiguredCourseUrls();
  const merged = { ...DEFAULT_CAFE24_COURSE_URLS, ...configured };
  const keys = [course.id, course.slug, course.title].filter(Boolean) as string[];

  for (const key of keys) {
    const exact = merged[key];
    if (exact) return appendTracking(exact, course);
  }

  const title = course.title || "";
  const fuzzy = Object.entries(merged).find(([key]) => title.includes(key) || key.includes(title));
  return fuzzy ? appendTracking(fuzzy[1], course) : "";
}

export function getCafe24ShopUrl() {
  return CAFE24_SHOP_URL;
}
