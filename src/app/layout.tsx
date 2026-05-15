import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import KakaoInAppGuide from "@/components/ui/KakaoInAppGuide";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "리바운드에듀 | 교육으로 신뢰를 판다.",
  description:
    "부동산·공간사업 전문가의 교육 플랫폼. 중개업, 숙박업, 공실·사업장, AI자동화, 투자개발 분야의 실전 노하우를 배우세요.",
  metadataBase: new URL("https://edu.rebound.io.kr"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "리바운드에듀",
  },
  openGraph: {
    siteName: "리바운드에듀",
    locale: "ko_KR",
    type: "website",
    title: "리바운드에듀 | 부동산·공간사업 전문 교육 플랫폼",
    description: "현장 전문가가 직접 가르치는 부동산 실전 교육. 중개업·숙박업·투자개발·AI자동화·공실해결",
    images: [{ url: "/api/og?title=리바운드에듀&instructor=&price=&category=", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "리바운드에듀 | 부동산·공간사업 전문 교육 플랫폼",
    description: "현장 전문가가 직접 가르치는 부동산 실전 교육",
    images: ["/api/og?title=리바운드에듀"],
  },
  icons: {
    icon: "/icon-128.png",
    apple: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF6600",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "리바운드에듀",
              url: "https://edu.rebound.io.kr",
              description: "부동산·공간사업 전문가의 교육 플랫폼",
              provider: { "@type": "Organization", name: "주식회사 리바운드", telephone: "1644-2909" },
            }),
          }}
        />
        <KakaoInAppGuide />
        {children}
        <PWAInstallBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8VH6L8MPPY" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-8VH6L8MPPY');`}
        </Script>
      </body>
    </html>
  );
}
