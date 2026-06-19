"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout.jsx";
import { MovieCard } from "@/components/MovieCard.jsx";
import { fetchByCategory, fetchByTypeList } from "@/lib/ophim.js";

function GenreInner() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prevSlug = useRef(slug);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const isPhimMoi = slug === "phim-moi";

  useEffect(() => {
    if (prevSlug.current !== slug) {
      prevSlug.current = slug;
      router.replace(`/genre/${slug}?page=1`);
    }
  }, [slug, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["genre", slug, page],
    queryFn: () =>
      isPhimMoi
        ? fetchByTypeList("phim-moi-cap-nhat", page, 24)
        : fetchByCategory(slug, page, 24),
  });

  const movies = data?.items || [];
  const totalPages = Math.min(data?.totalPages || 1, 50);

  const handlePageChange = (newPage) => {
    router.push(`/genre/${slug}?page=${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5 flex items-end p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">
              {data?.title || slug?.replace(/-/g, " ")}
            </h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {movies.length} phim trong trang này
              </p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-card rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function GenrePage() {
  return (
    <Layout>
      <Suspense
        fallback={<div className="p-6 text-muted-foreground">Đang tải...</div>}
      >
        <GenreInner />
      </Suspense>
    </Layout>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const win = 5;
  let start = Math.max(1, page - Math.floor(win / 2));
  let end = Math.min(totalPages, start + win - 1);
  start = Math.max(1, end - win + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        Trước
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className="w-9 h-9 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground"
          >
            1
          </button>
          {start > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="text-muted-foreground">...</span>
          )}
          <button
            onClick={() => onChange(totalPages)}
            className="w-9 h-9 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  );
}
