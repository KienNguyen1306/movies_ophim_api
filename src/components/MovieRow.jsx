"use client";
import { ChevronLeft, ChevronRight, ChevronRight as Arrow } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { MovieCard } from "./MovieCard.jsx";

export function MovieRow({ title, movies, loading, moreHref }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!loading && (!movies || !movies.length)) return null;

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-end justify-between mb-3 px-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Xem thêm <Arrow className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="relative group/row">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-12 z-10 w-10 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        <div ref={scrollRef} className="scroll-row">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-[180px] sm:w-[220px] md:w-[260px] flex-shrink-0">
                  <div className="aspect-video rounded-xl bg-card animate-pulse" />
                  <div className="h-4 mt-2 bg-card rounded animate-pulse w-3/4" />
                </div>
              ))
            : movies.map((movie) => (
                <div key={movie.id} className="w-[180px] sm:w-[220px] md:w-[260px] flex-shrink-0 snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-12 z-10 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
