import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "리바운드에듀 | 교육으로 신뢰를 판다.",
  description:
    "부동산·공간사업 전문가의 교육 플랫폼. 중개업, 숙박업, 공실·사업장, AI자동화, 투자개발 분야의 실전 노하우를 배우세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
