"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA 앱 설치 유도 배너
 * - Android: beforeinstallprompt 이벤트 활용
 * - iOS: Safari "홈 화면에 추가" 안내
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 이미 PWA로 실행 중이면 배너 숨김
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // 이미 닫은 적 있으면 24시간 동안 숨김
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }

    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS/i.test(ua);
    const isKakao = /KAKAOTALK/i.test(ua);
    setIsIOS(ios);

    // 카카오톡 인앱브라우저에서는 표시하지 않음
    if (isKakao) return;

    // Android: beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: 3초 후 표시
    if (ios && /Safari/i.test(ua)) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700">
        <div className="flex items-start gap-3">
          {/* 앱 아이콘 */}
          <div className="w-12 h-12 rounded-xl bg-[#FF6600] flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-black text-lg">R</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">리바운드에듀</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  앱으로 설치하면 더 빠르게 이용할 수 있어요
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-300 transition flex-shrink-0 mt-0.5"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3">
              {isIOS ? (
                /* iOS: 홈 화면에 추가 안내 */
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <Share size={16} className="text-[#FF6600] flex-shrink-0" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      하단 <strong className="text-white">공유 버튼</strong>을 누르고{" "}
                      <strong className="text-white">"홈 화면에 추가"</strong>를 선택하세요
                    </p>
                  </div>
                </div>
              ) : (
                /* Android: 설치 버튼 */
                <button
                  onClick={handleInstall}
                  className="w-full py-2.5 rounded-xl bg-[#FF6600] text-white text-sm font-bold hover:bg-[#e85d00] transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  앱 설치하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
