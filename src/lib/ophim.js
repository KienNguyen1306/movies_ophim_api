/**
 * OPhim API client — phiên bản proxy + mã hóa
 *
 * - Không gọi trực tiếp ophim1.com từ client
 * - Tất cả request đi qua /api/proxy (server-side)
 * - Response được mã hóa AES-GCM, giải mã trước khi dùng
 */

import { decrypt } from "@/lib/crypto";

const IMG_BASE = "https://img.ophim.live/uploads/movies/";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Gọi proxy nội bộ, giải mã response rồi trả JSON gốc.
 *
 * @param {string} path   Đường dẫn API, ví dụ "/phim/slug-phim"
 * @param {Record<string,string|number>} [params]  Query params gốc
 */
async function proxyFetch(path, params = {}) {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();

  const proxyUrl = `/api/proxy?path=${encodeURIComponent(path)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);

  const token = await res.text(); // chuỗi base64 mã hóa
  return decrypt(token); // giải mã → dữ liệu gốc
}

// ─── Image URL ────────────────────────────────────────────────────────────────

export const imgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `https://img.ophim.live${path}`;
  return `${IMG_BASE}${path}`;
};

// ─── Normalizers ──────────────────────────────────────────────────────────────

export const normalizeItem = (it) => ({
  id: it.slug,
  slug: it.slug,
  title: it.name,
  originName: it.origin_name,
  year: it.year,
  rating: it.tmdb?.vote_average
    ? Number(it.tmdb.vote_average).toFixed(1)
    : null,
  duration: it.time || it.episode_current || "",
  episodeCurrent: it.episode_current,
  quality: it.quality,
  lang: it.lang,
  thumbnail: imgUrl(it.thumb_url),
  poster: imgUrl(it.poster_url),
  backdrop: imgUrl(it.poster_url || it.thumb_url),
  genre: (it.category || []).map((c) => c.name),
  country: (it.country || []).map((c) => c.name).join(", "),
});

// ─── API functions ────────────────────────────────────────────────────────────

export const fetchLatest = async (page = 1) => {
  const data = await proxyFetch("/danh-sach/phim-moi-cap-nhat", { page });
  return (data.items || []).map(normalizeItem);
};

export const fetchByTypeList = async (typeList, page = 1, limit = 12) => {
  const data = await proxyFetch(`/v1/api/danh-sach/${typeList}`, {
    page,
    limit,
  });
  const items = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  return {
    items: items.map(normalizeItem),
    totalPages: pagination
      ? Math.max(
          1,
          Math.ceil(pagination.totalItems / pagination.totalItemsPerPage),
        )
      : 1,
  };
};

export const fetchByCategory = async (slug, page = 1, limit = 24) => {
  const data = await proxyFetch(`/v1/api/the-loai/${slug}`, { page, limit });
  const items = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  return {
    items: items.map(normalizeItem),
    title: data?.data?.titlePage || slug,
    totalPages: pagination
      ? Math.max(
          1,
          Math.ceil(pagination.totalItems / pagination.totalItemsPerPage),
        )
      : 1,
  };
};

export const fetchByCountry = async (slug, page = 1, limit = 24) => {
  const data = await proxyFetch(`/v1/api/quoc-gia/${slug}`, { page, limit });
  const items = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  return {
    items: items.map(normalizeItem),
    title: data?.data?.titlePage || slug,
    totalPages: pagination
      ? Math.max(
          1,
          Math.ceil(pagination.totalItems / pagination.totalItemsPerPage),
        )
      : 1,
  };
};

export const searchMovies = async (keyword, page = 1, limit = 24) => {
  if (!keyword?.trim()) return { items: [], totalPages: 1 };
  const data = await proxyFetch("/v1/api/tim-kiem", {
    keyword: keyword.trim(),
    page,
    limit,
  });
  const items = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  return {
    items: items.map(normalizeItem),
    totalPages: pagination
      ? Math.max(
          1,
          Math.ceil(pagination.totalItems / pagination.totalItemsPerPage),
        )
      : 1,
  };
};

export const fetchCategories = async () => {
  const data = await proxyFetch("/the-loai");
  return Array.isArray(data) ? data : data?.data?.items || [];
};

export const fetchCountries = async () => {
  const data = await proxyFetch("/v1/api/quoc-gia");
  return data?.data?.items || [];
};

export const fetchMovieDetail = async (slug) => {
  const data = await proxyFetch(`/phim/${slug}`);
  if (!data?.status) return null;
  const m = data.movie;
  return {
    id: m.slug,
    slug: m.slug,
    title: m.name,
    originName: m.origin_name,
    description: (m.content || "").replace(/<[^>]+>/g, ""),
    year: m.year,
    duration: m.time,
    rating: m.tmdb?.vote_average
      ? Number(m.tmdb.vote_average).toFixed(1)
      : null,
    quality: m.quality,
    lang: m.lang,
    type: m.type,
    status: m.status,
    episodeCurrent: m.episode_current,
    episodeTotal: m.episode_total,
    trailerUrl: m.trailer_url,
    thumbnail: imgUrl(m.thumb_url),
    poster: imgUrl(m.poster_url),
    backdrop: imgUrl(m.poster_url || m.thumb_url),
    genre: (m.category || []).map((c) => ({ name: c.name, slug: c.slug })),
    country: (m.country || []).map((c) => ({ name: c.name, slug: c.slug })),
    actor: (m.actor || []).filter(Boolean),
    director: (m.director || []).filter(Boolean),
    episodes: data.episodes || [],
  };
};
