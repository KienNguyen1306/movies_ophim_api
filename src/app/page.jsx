"use client";
import { Layout } from "@/components/Layout.jsx";
import { HeroBanner } from "@/components/HeroBanner.jsx";
import { MovieRow } from "@/components/MovieRow.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchLatest, fetchByTypeList } from "@/lib/ophim.js";

const TYPE_LISTS = [
  { slug: "phim-le", title: "Phim Lẻ" },
  { slug: "phim-bo", title: "Phim Bộ" },
  { slug: "hoat-hinh", title: "Hoạt Hình" },
  { slug: "phim-sap-chieu", title: "Phim Sắp Chiếu" },
];

function TypeRow({ slug, title }) {
  const { data, isLoading } = useQuery({
    queryKey: ["list", slug, 1],
    queryFn: () => fetchByTypeList(slug, 1, 12),
  });
  return (
    <MovieRow
      title={title}
      movies={data?.items || []}
      loading={isLoading}
      moreHref={`/list/${slug}`}
    />
  );
}

export default function HomePage() {
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => fetchLatest(1) });
  const heroMovie = latest.data?.[0];

  return (
    <Layout>
      {heroMovie && <HeroBanner movie={heroMovie} />}
      <div className="px-6 pb-12">
        <MovieRow
          title="Phim Mới Cập Nhật"
          movies={latest.data || []}
          loading={latest.isLoading}
          moreHref="/list/phim-moi-cap-nhat"
        />
        {TYPE_LISTS.map((t) => (
          <TypeRow key={t.slug} slug={t.slug} title={t.title} />
        ))}
      </div>
    </Layout>
  );
}
