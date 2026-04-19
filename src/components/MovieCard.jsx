"use client";
import { Play, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/contexts/SidebarContext.jsx";

export function MovieCard({ movie }) {
  const { isMobile, setMobileOpen, setCollapsed } = useSidebar();

  const handleClick = () => {
    if (isMobile) setMobileOpen(false);
    else setCollapsed(true);
  };

  return (
    <Link
      href={`/watch/${movie.slug}`}
      onClick={handleClick}
      className="movie-card-hover group relative flex-shrink-0 w-full snap-start rounded-xl overflow-hidden bg-card"
    >
      <div className="relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.thumbnail}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {movie.quality && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
            {movie.quality}
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
        >
          <Plus className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground truncate" title={movie.title}>{movie.title}</h3>
        {movie.originName && (
          <p className="text-xs text-muted-foreground truncate">{movie.originName}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {movie.year && <span className="text-xs text-muted-foreground">{movie.year}</span>}
          {movie.rating && (
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              <span className="text-muted-foreground">{movie.rating}</span>
            </span>
          )}
          {movie.episodeCurrent && (
            <span className="text-xs text-muted-foreground truncate">{movie.episodeCurrent}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
