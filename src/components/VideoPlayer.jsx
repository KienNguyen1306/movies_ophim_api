"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, SkipForward, Loader2 } from "lucide-react";

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ src, poster, onNext, hasNext }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const hideTimer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(false);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls;
    setLoading(true);
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  const seekBy = useCallback((delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0), v.currentTime + delta));
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const w = wrapRef.current;
    if (!w) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else w.requestFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowLeft" || e.key === "j") { e.preventDefault(); seekBy(-10); }
      else if (e.key === "ArrowRight" || e.key === "l") { e.preventDefault(); seekBy(10); }
      else if (e.key === "f") { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === "m") { e.preventDefault(); toggleMute(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy]);

  const bumpControls = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2500);
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const onProgress = () => {
    const v = videoRef.current;
    if (!v || !v.buffered.length) return;
    setBuffered(v.buffered.end(v.buffered.length - 1));
  };

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card">
        <p className="text-muted-foreground text-sm">Không có nguồn video</p>
      </div>
    );
  }

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full bg-black group/player"
      onMouseMove={bumpControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        autoPlay
        playsInline
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); bumpControls(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onProgress={onProgress}
        onEnded={() => { setPlaying(false); if (hasNext && onNext) onNext(); }}
        className="w-full h-full bg-black"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
          <button
            onClick={() => seekBy(-10)}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            title="Tua lại 10s"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            {playing ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8" fill="currentColor" />}
          </button>
          <button
            onClick={() => seekBy(10)}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            title="Tua tới 10s"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>

        <div className="px-3 sm:px-4 pb-2">
          <div
            className="relative h-1.5 hover:h-2 bg-white/25 rounded-full cursor-pointer mb-2 transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const r = (e.clientX - rect.left) / rect.width;
              const v = videoRef.current;
              if (v && duration) v.currentTime = r * duration;
            }}
          >
            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg"
              style={{ left: `calc(${pct}% - 6px)` }}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <button onClick={togglePlay} className="p-1.5 hover:bg-white/10 rounded-full">
              {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button onClick={() => seekBy(-10)} className="p-1.5 hover:bg-white/10 rounded-full" title="-10s">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => seekBy(10)} className="p-1.5 hover:bg-white/10 rounded-full" title="+10s">
              <RotateCw className="w-5 h-5" />
            </button>
            {hasNext && (
              <button onClick={onNext} className="p-1.5 hover:bg-white/10 rounded-full" title="Tập tiếp theo">
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-full">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = false;
                  v.volume = parseFloat(e.target.value);
                }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-primary"
              />
            </div>

            <span className="text-xs tabular-nums text-white/90">
              {fmt(current)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/10 rounded-full" title="Toàn màn hình">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
