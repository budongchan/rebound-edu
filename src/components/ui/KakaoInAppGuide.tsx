"use client";

import { useEffect, useState } from "react";

/**
 * 카카오톡 인앱브라우저 감지 → 외부 브라우저로 열기 안내 오버레이
 * BNI promise 로그인 화면 스타일 참고
 */
export default function KakaoInAppGuide() {
  const [isKakao, setIsKakao] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const kakao = /KAKAOTALK/i.test(ua);
    setIsKakao(kakao);
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
  }, []);

  if (!isKakao) return null;

  const handleOpenExternal = () => {
    const currentUrl = window.location.href;

    if (isIOS) {
      // iOS: Safari로 열기
      window.location.href = currentUrl;
      setTimeout(() => {
        // fallback: 클립보드 안내
      }, 500);
    } else {
      // Android: intent scheme으로 Chrome 열기
      const intentUrl =
        "intent://" +
        currentUrl.replace(/https?:\/\//, "") +
        "#Intent;scheme=https;package=com.android.chrome;end";
      window.location.href = intentUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-6">
      {/* 로고 */}
      <div className="mb-8 flex items-center gap-1.5">
        <div className="w-10 h-10 rounded-xl bg-[#FF6600] flex items-center justify-center shadow-md">
          <span className="text-white font-black text-xl">R</span>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-[#FF6600]">리바운드</span>
          <span className="text-2xl font-extrabold text-gray-900">에듀</span>
        </div>
      </div>

      {/* 안내 박스 */}
      <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-4 bg-[#FEE500] rounded-full flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#391B1B">
            <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.76 1.82 5.18 4.56 6.56-.14.52-.92 3.36-.95 3.58 0 0-.02.16.08.22.1.06.22.02.22.02.3-.04 3.44-2.26 3.98-2.64.68.1 1.38.14 2.1.14 5.52 0 10-3.54 10-7.88S17.52 3 12 3z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          외부 브라우저에서 열어주세요
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          카카오톡 브라우저에서는 일부 기능이<br />
          제한될 수 있습니다.
        </p>

        {/* 외부 브라우저 열기 버튼 */}
        <button
          onClick={handleOpenExternal}
          className="w-full py-3.5 rounded-xl bg-[#FF6600] text-white font-bold text-[15px] hover:bg-[#e85d00] transition shadow-sm mb-3"
        >
          {isIOS ? "Safari로 열기" : "Chrome으로 열기"}
        </button>

        {/* 수동 안내 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-left">
          <p className="text-xs font-bold text-gray-700 mb-2.5">
            자동으로 열리지 않는다면:
          </p>
          {isIOS ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span className="text-xs text-gray-600">우측 하단 <strong>ᐧᐧᐧ</strong> 메뉴를 탭하세요</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span className="text-xs text-gray-600"><strong>"다른 브라우저로 열기"</strong>를 선택하세요</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span className="text-xs text-gray-600">우측 상단 <strong>⋮</strong> 메뉴를 탭하세요</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span className="text-xs text-gray-600"><strong>"다른 브라우저에서 열기"</strong>를 선택하세요</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="mt-6 text-[11px] text-gray-400 text-center">
        외부 브라우저에서 더 안정적으로 이용할 수 있습니다.
      </p>
    </div>
  );
}
