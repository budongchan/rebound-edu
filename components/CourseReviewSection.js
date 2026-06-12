"use client";

import { useMemo, useState } from "react";

export default function CourseReviewSection({ courseTitle, reviews = [], color = "#14110f", contactEmail = "info@rebound.io.kr" }) {
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const reviewText = useMemo(() => {
    const writer = name.trim() || "익명";
    const content = body.trim() || "수강 후기를 입력해 주세요.";
    return `[리바운드에듀 수강 리뷰]\n수업: ${courseTitle}\n평점: ${rating}/5\n작성자: ${writer}\n\n${content}`;
  }, [body, courseTitle, name, rating]);

  async function copyReview() {
    await navigator.clipboard.writeText(reviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(`[리바운드에듀 리뷰] ${courseTitle}`)}&body=${encodeURIComponent(reviewText)}`;

  return (
    <div className="rounded-2xl border border-line bg-paper p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-ink">수강 리뷰</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            실제 수강 후기를 남길 수 있습니다. 공개 리뷰는 확인 후 상세페이지에 반영됩니다.
          </p>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-[12px] font-black text-ink-soft">
          공개 리뷰 {reviews.length}건
        </span>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {reviews.map((review) => (
            <figure key={`${review.name}-${review.date}`} className="rounded-xl border border-line bg-cream/45 p-5">
              <div className="flex items-center justify-between gap-3">
                <figcaption className="text-[14px] font-black text-ink">{review.name}</figcaption>
                <span className="text-[12px] font-bold text-ink-soft">{review.rating}/5</span>
              </div>
              <blockquote className="mt-3 text-[14px] leading-relaxed text-ink-soft">{review.body}</blockquote>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-line bg-cream/35 p-5 text-[14px] leading-relaxed text-ink-soft">
          아직 공개된 수강 리뷰가 없습니다. 첫 수강 후기를 남겨주시면 확인 후 반영하겠습니다.
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-[120px_1fr]">
        <label className="text-[13px] font-extrabold text-ink" htmlFor="review-rating">
          평점
        </label>
        <select
          id="review-rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="rounded-xl border border-line bg-paper px-4 py-3 text-[14px] font-bold text-ink outline-none"
        >
          <option value="5">5점</option>
          <option value="4">4점</option>
          <option value="3">3점</option>
          <option value="2">2점</option>
          <option value="1">1점</option>
        </select>

        <label className="text-[13px] font-extrabold text-ink" htmlFor="review-name">
          이름
        </label>
        <input
          id="review-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="선택 입력"
          className="rounded-xl border border-line bg-paper px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-soft/55"
        />

        <label className="text-[13px] font-extrabold text-ink" htmlFor="review-body">
          후기
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="수업에서 좋았던 점, 도움이 된 부분, 개선 의견을 남겨주세요."
          rows={4}
          className="resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/55"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyReview}
          className="rounded-xl px-5 py-3 text-[13px] font-black text-white"
          style={{ background: color }}
        >
          리뷰 내용 복사
        </button>
        <a
          href={mailto}
          className="rounded-xl border border-line bg-paper px-5 py-3 text-[13px] font-black text-ink transition-colors hover:bg-cream"
        >
          이메일로 리뷰 보내기
        </a>
        {copied && <span className="self-center text-[12px] font-bold text-ink-soft">복사했습니다.</span>}
      </div>
    </div>
  );
}
