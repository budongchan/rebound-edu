import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "리바운드에듀 | 부동산·공간사업 전문 교육",
  description:
    "공실 해결, 부동산 중개, 호스텔 창업, AI 업무자동화 등 실전 중심의 온라인 교육 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
