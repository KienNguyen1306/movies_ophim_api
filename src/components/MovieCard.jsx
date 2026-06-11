"use client";
import { useState } from "react";
import { Play, Plus, Star, Bookmark } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/contexts/SidebarContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useToast } from "@/contexts/ToastContext.jsx";

export function MovieCard({ movie, onDelete }) {
  const { isMobile, setMobileOpen, setCollapsed } = useSidebar();
  const { user } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  const slug = movie?.slug || "";
  const title = movie?.title || movie?.name || "Phim chưa có tên";
  const thumbnail =
    movie?.thumbnail || movie?.thumb_url || movie?.poster_url || "";
  const year = movie?.year || "";

  const handleClick = () => {
    if (isMobile) setMobileOpen(false);
    else setCollapsed(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning("Vui lòng đăng nhập để lưu phim");
      return;
    }

    if (savingLoading) return;
    setSavingLoading(true);

    try {
      if (saved) {
        const res = await fetch("/api/user/saved-movies", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieSlug: slug }),
        });
        if (res.ok) {
          setSaved(false);
          toast.info("Đã bỏ lưu phim");
        }
      } else {
        const res = await fetch("/api/user/saved-movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieSlug: slug,
            movieName: title,
            movieThumb: thumbnail,
            movieYear: String(year),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSaved(true);
          toast.success(data.message || "Đã lưu phim");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra, thử lại sau");
    } finally {
      setSavingLoading(false);
    }
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

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play
              className="w-5 h-5 text-primary-foreground ml-0.5"
              fill="currentColor"
            />
          </div>
        </div>

        {movie.quality && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
            {movie.quality}
          </span>
        )}

        {/* Nút lưu phim */}
        <button
          onClick={handleSave}
          disabled={savingLoading}
          title={saved ? "Bỏ lưu phim" : "Lưu phim"}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            saved
              ? "bg-primary opacity-100"
              : "bg-background/60 opacity-0 group-hover:opacity-100 hover:bg-background/80"
          }`}
        >
          {savingLoading ? (
            <svg
              className="w-3.5 h-3.5 animate-spin text-foreground"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : saved ? (
            <Bookmark
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
            />
          ) : (
            <Plus className="w-4 h-4 text-foreground" />
          )}
        </button>
      </div>

      {/* Thông tin phim */}
      <div className="p-3">
        <h3
          className="text-sm font-medium text-foreground truncate"
          title={movie.title}
        >
          {movie.title}
        </h3>
        {movie.originName && (
          <p className="text-xs text-muted-foreground truncate">
            {movie.originName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {movie.year && (
            <span className="text-xs text-muted-foreground">{movie.year}</span>
          )}
          {movie.rating && (
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              <span className="text-muted-foreground">{movie.rating}</span>
            </span>
          )}
          {movie.episodeCurrent && (
            <span className="text-xs text-muted-foreground truncate">
              {movie.episodeCurrent}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
