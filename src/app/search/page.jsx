"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout.jsx";
import { MovieCard } from "@/components/MovieCard.jsx";
import { searchMovies } from "@/lib/ophim.js";

function SearchInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, page],
    queryFn: () => searchMovies(query, page, 24),
    enabled: !!query,
  });

  const results = data?.items || [];
  const totalPages = Math.min(data?.totalPages || 1, 50);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Kết quả cho "{query}"
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isLoading ? "Đang tìm..." : `${results.length} kết quả trang này`}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-video bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Không tìm thấy phim. Thử từ khóa khác.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-40">Trước</button>
          <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-40">Sau</button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="p-6 text-muted-foreground">Đang tải...</div>}>
        <SearchInner />
      </Suspense>
    </Layout>
  );
}
