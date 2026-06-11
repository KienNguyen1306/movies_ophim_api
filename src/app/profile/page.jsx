"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Calendar,
  Film,
  LogIn,
  Loader2,
  X,
} from "lucide-react";
import { Layout } from "@/components/Layout.jsx";
import { MovieCard } from "@/components/MovieCard.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";

const toCardProps = (m) => ({
  slug: m.movie_slug,
  title: m.movie_name,
  thumbnail: m.movie_thumb,
  year: m.movie_year,
});

// ─── DeletableCard ────────────────────────────────────────────────────────────
function DeletableCard({ movie, tabId, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(movie.movie_slug, tabId, movie);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col group relative">
      {/* Nút xóa – xuất hiện khi hover */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="
          cursor-pointer absolute top-1.5 right-1.5 z-10
          w-7 h-7 rounded-full flex items-center justify-center
          bg-black/60 backdrop-blur-sm border border-white/10
          text-white opacity-0 group-hover:opacity-100
          hover:bg-red-500 hover:border-red-400
          transition-all duration-200
          disabled:opacity-50
        "
        title="Xóa khỏi danh sách"
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
      </button>

      <MovieCard movie={toCardProps(movie)} />
      <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
        Đã lưu {new Date(movie.created_at).toLocaleDateString("vi-VN")}
      </p>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState("favorites");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [savedRes, reactionsRes] = await Promise.all([
          fetch("/api/user/saved-movies"),
          fetch("/api/user/liked-movies"),
        ]);
        if (savedRes.ok) {
          const data = await savedRes.json();
          setFavorites(data.saved || []);
        }
        if (reactionsRes.ok) {
          const data = await reactionsRes.json();
          setLiked(data.liked || []);
          setDisliked(data.disliked || []);
        }
      } catch {
        /* bỏ qua */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  // ── Xử lý xóa theo từng tab ──────────────────────────────────────────────
  const handleDelete = useCallback(async (movieSlug, tabId, movie) => {
    if (tabId === "favorites") {
      const res = await fetch("/api/user/saved-movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieSlug }),
      });
      if (res.ok)
        setFavorites((prev) => prev.filter((m) => m.movie_slug !== movieSlug));
    } else {
      // POST với cùng reaction = toggle off (xóa)
      const reaction = tabId === "liked" ? "like" : "dislike";
      const res = await fetch("/api/user/liked-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieSlug,
          movieName: movie.movie_name,
          movieThumb: movie.movie_thumb,
          movieYear: movie.movie_year,
          reaction,
        }),
      });
      if (res.ok) {
        const setter = tabId === "liked" ? setLiked : setDisliked;
        setter((prev) => prev.filter((m) => m.movie_slug !== movieSlug));
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <LogIn className="w-9 h-9 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bạn chưa đăng nhập
          </h1>
          <p className="text-muted-foreground mb-6">
            Vui lòng đăng nhập để xem trang cá nhân.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="cursor-pointer px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="cursor-pointer px-5 py-2.5 rounded-full bg-secondary text-foreground font-medium hover:bg-accent transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const TABS = [
    {
      id: "favorites",
      label: "Yêu thích",
      icon: Heart,
      color: "text-pink-500",
      data: favorites,
    },
    {
      id: "liked",
      label: "Đã thích",
      icon: ThumbsUp,
      color: "text-primary",
      data: liked,
    },
    {
      id: "disliked",
      label: "Không thích",
      icon: ThumbsDown,
      color: "text-muted-foreground",
      data: disliked,
    },
  ];

  const activeTab = TABS.find((t) => t.id === active);
  const initial = user.name?.[0]?.toUpperCase() || "U";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-card to-card border border-border p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-primary-foreground font-bold text-4xl">
                {initial}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 truncate">
                {user.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </span>
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Tham gia 2025
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto sm:mx-0">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.id}
                      className="bg-background/40 rounded-xl px-3 py-2.5 text-center"
                    >
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${t.color}`} />
                      {loading ? (
                        <div className="h-6 w-6 mx-auto bg-muted animate-pulse rounded" />
                      ) : (
                        <p className="text-lg font-bold text-foreground leading-none">
                          {t.data.length}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border mb-6 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? t.color : ""}`} />
                {t.label}
                <span className="text-xs text-muted-foreground">
                  ({loading ? "…" : t.data.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : activeTab.data.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Danh sách trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeTab.data.map((m) => (
              <DeletableCard
                key={m.movie_slug}
                movie={m}
                tabId={active}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
