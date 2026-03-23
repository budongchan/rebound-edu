"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface VideoPlayerProps {
  /** Cloudflare Stream video ID, or full URL (mp4/m3u8) */
  src: string;
  /** Optional poster image */
  poster?: string;
  /** Callback when progress updates (0~100) */
  onProgress?: (percent: number) => void;
  /** Callback when video completes */
  onComplete?: () => void;
  /** Start from this position (seconds) */
  startPosition?: number;
}

/**
 * Universal VOD Player
 * - Cloudflare Stream: pass the video ID (auto-generates iframe URL)
 * - Direct URL: pass mp4/m3u8 URL (uses native <video>)
 */
export default function VideoPlayer({
  src,
  poster,
  onProgress,
  onComplete,
  startPosition = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Detect if src is a Cloudflare Stream ID (not a URL)
  const isCloudflareStream = src && !src.includes("/") && !src.includes(".");

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    setProgress(pct);
    setCurrentTime(video.currentTime);
    onProgress?.(Math.round(pct));
  };

  const handleEnded = () => {
    setEnded(true);
    setPlaying(false);
    onComplete?.();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (ended) {
      video.currentTime = 0;
      setEnded(false);
    }
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && startPosition > 0) {
      video.currentTime = startPosition;
    }
  }, [startPosition]);

  // Cloudflare Stream — use iframe embed
  if (isCloudflareStream) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://customer-${src}.cloudflarestream.com/${src}/iframe?poster=${poster || ""}`}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // No src — placeholder
  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Play size={48} className="text-white/30 mx-auto mb-3" />
          <p className="text-white/50 text-sm">강의 영상 준비 중입니다</p>
        </div>
      </div>
    );
  }

  // Direct URL — native video
  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            if (startPosition > 0) videoRef.current.currentTime = startPosition;
          }
        }}
        onEnded={handleEnded}
        muted={muted}
        playsInline
      />

      {/* Play/Pause overlay */}
      {(!playing || showControls) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            {ended ? (
              <RotateCcw size={28} className="text-gray-900" />
            ) : playing ? (
              <Pause size={28} className="text-gray-900" />
            ) : (
              <Play size={28} className="text-gray-900 ml-1" />
            )}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/bar"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-brand rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-brand transition">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => setMuted(!muted)} className="text-white hover:text-brand transition">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-xs text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-brand transition">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
