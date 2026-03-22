import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_LABELS: Record<string, string> = {
  vacancy: "공실·사업장",
  brokerage: "중개업",
  hostel: "숙박업",
  ai_automation: "AI자동화",
  investment: "투자개발",
};

const CATEGORY_COLORS: Record<string, string> = {
  vacancy: "#ee5a24",
  brokerage: "#228be6",
  hostel: "#40c057",
  ai_automation: "#7950f2",
  investment: "#fd7e14",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "리바운드에듀";
  const instructor = searchParams.get("instructor") || "";
  const price = searchParams.get("price") || "";
  const category = searchParams.get("category") || "";

  const categoryLabel = CATEGORY_LABELS[category] || "";
  const categoryColor = CATEGORY_COLORS[category] || "#FF6600";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "white",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
        }}
      >
        {/* Left orange bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "12px",
            height: "100%",
            background: "#FF6600",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px 50px 60px",
            marginLeft: "12px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Top section */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Category + Price badges */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
              {categoryLabel && (
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: categoryColor,
                    background: `${categoryColor}15`,
                    padding: "6px 18px",
                    borderRadius: "8px",
                  }}
                >
                  {categoryLabel}
                </span>
              )}
              {price && (
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: price === "무료" ? "#40c057" : "#FF6600",
                    background:
                      price === "무료" ? "#40c05715" : "#FF660015",
                    padding: "6px 18px",
                    borderRadius: "8px",
                  }}
                >
                  {price}
                </span>
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: title.length > 20 ? "52px" : "62px",
                fontWeight: 900,
                color: "#111",
                lineHeight: 1.2,
                letterSpacing: "-1px",
                maxWidth: "900px",
              }}
            >
              {title}
            </div>

            {/* Instructor */}
            {instructor && (
              <div
                style={{
                  fontSize: "26px",
                  color: "#666",
                  marginTop: "20px",
                  fontWeight: 500,
                }}
              >
                {instructor} 강사
              </div>
            )}
          </div>

          {/* Bottom: Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  color: "#FF6600",
                }}
              >
                리바운드
              </span>
              <span
                style={{ fontSize: "30px", fontWeight: 900, color: "#111" }}
              >
                에듀
              </span>
            </div>
            <span style={{ fontSize: "18px", color: "#aaa" }}>
              edu.rebound.io.kr
            </span>
          </div>
        </div>

        {/* Right decorative gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "100%",
            background: `linear-gradient(135deg, ${categoryColor}08, ${categoryColor}20)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
