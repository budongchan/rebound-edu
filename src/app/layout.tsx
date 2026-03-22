import type { Metadata, Viewport } from "next";
import "./globals.css";
import KakaoInAppGuide from "@/components/ui/KakaoInAppGuide";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";

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
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
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
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
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
      </body>
    </html>
  );
}
