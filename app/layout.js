import "./globals.css";
import { COMPANY } from "@/lib/company";

export const metadata = {
  metadataBase: new URL("https://edu.rebound.io.kr"),
  title: {
    default: "리바운드에듀 | 교육으로 신뢰를 판다",
    template: "%s | 리바운드에듀",
  },
  description:
    "부동산·공간사업 전문가 교육 플랫폼. 현장 전문가가 직접 가르치는 중개업·숙박업·투자개발·AI자동화·공실해결 실전 강의.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "리바운드에듀 | 교육으로 신뢰를 판다",
    description:
      "현장 전문가가 직접 가르치는 부동산 실전 교육 — 중개업·숙박업·투자개발·AI자동화·공실해결.",
    url: "https://edu.rebound.io.kr",
    siteName: "리바운드에듀",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
