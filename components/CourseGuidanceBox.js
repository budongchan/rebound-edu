export default function CourseGuidanceBox({ guidance, compact = false }) {
  if (!guidance) return null;

  const rows = [
    guidance.schedule ? ["수업 일정", guidance.schedule] : null,
    guidance.locationName ? ["수업 장소", guidance.locationName] : null,
    guidance.address ? ["주소", guidance.address] : null,
  ].filter(Boolean);

  return (
    <div className={`rounded-xl border border-line bg-cream/60 ${compact ? "p-4" : "p-5"}`}>
      <h3 className="text-[15px] font-extrabold text-ink">수업 입장 안내</h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-[13px]">
            <dt className="shrink-0 text-ink-soft">{label}</dt>
            <dd className="text-right font-semibold leading-relaxed text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {guidance.naverPlaceUrl ? (
          <a
            href={guidance.naverPlaceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-[12px] font-bold text-ink-soft hover:text-ink"
          >
            네이버플레이스 보기
          </a>
        ) : null}
        {guidance.groupChatUrl ? (
          <a
            href={guidance.groupChatUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-ink px-3 py-2 text-[12px] font-bold text-white"
          >
            단톡방 입장
          </a>
        ) : (
          <span className="rounded-lg border border-line bg-paper px-3 py-2 text-[12px] font-semibold text-ink-soft">
            {guidance.groupChatLabel || "단톡방 초대 링크는 별도 안내드립니다."}
          </span>
        )}
        {guidance.inquiryUrl ? (
          <a
            href={guidance.inquiryUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-[12px] font-bold text-ink-soft hover:text-ink"
          >
            카카오톡 문의
          </a>
        ) : null}
      </div>
    </div>
  );
}
