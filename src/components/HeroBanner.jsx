"use client";
import { Play, Info } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/contexts/SidebarContext.jsx";

export function HeroBanner({ movie }) {
  const { isMobile, setMobileOpen, setCollapsed } = useSidebar();

  const handlePlayClick = () => {
    if (isMobile) setMobileOpen(false);
    else setCollapsed(true);
  };

  if (!movie) return null;

  return (
    <div className="relative w-full h-[60vh] min-h-[360px] max-h-[560px] mb-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={movie.backdrop || movie.thumbnail}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-gradient-left absolute inset-0" />

      <div className="absolute bottom-12 left-8 right-8 max-w-xl z-10 animate-slide-up">
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-3 leading-tight">
          {movie.title}
        </h1>
        {movie.originName && (
          <p className="text-muted-foreground mb-3 text-sm sm:text-base">{movie.originName}</p>
        )}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {movie.year && <span className="text-sm text-muted-foreground">{movie.year}</span>}
          {movie.quality && <span className="text-sm font-medium text-primary">{movie.quality}</span>}
          {movie.episodeCurrent && <span className="text-sm text-muted-foreground">{movie.episodeCurrent}</span>}
          {movie.rating && <span className="text-sm font-medium text-yellow-500">★ {movie.rating}</span>}
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/watch/${movie.slug}`}
            onClick={handlePlayClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            Xem ngay
          </Link>
          <Link
            href={`/watch/${movie.slug}`}
            onClick={handlePlayClick}
            className="flex items-center gap-2 bg-secondary hover:bg-accent text-foreground px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Info className="w-5 h-5" />
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
