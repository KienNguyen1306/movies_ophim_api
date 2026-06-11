"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout.jsx";
import { VideoPlayer } from "@/components/VideoPlayer.jsx";
import { fetchMovieDetail, fetchByCategory, fetchLatest } from "@/lib/ophim.js";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  BookmarkPlus,
  Bookmark,
  Share2,
  User,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils.js";
import { useSidebar } from "@/contexts/SidebarContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useToast } from "@/contexts/ToastContext.jsx";

// ─── CommentItem ──────────────────────────────────────────────────────────────

function CommentItem({ comment, currentUser, onReply }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyName, setReplyName] = useState(currentUser?.name || "");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (currentUser?.name) setReplyName(currentUser.name);
  }, [currentUser?.name]);

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }
    setSubmitting(true);
    try {
      await onReply(comment.id, {
        name: replyName.trim(),
        text: replyText.trim(),
      });
      setReplyText("");
      setReplying(false);
      setShowReplies(true);
    } catch (err) {
      toast.warning(err.message || "Gửi phản hồi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-foreground">
          {comment.avatar}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.user}
          </span>
          <span className="text-xs text-muted-foreground">{comment.time}</span>
        </div>
        <p className="text-sm text-foreground mt-1">{comment.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => toast.notImplemented()}
            className="cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="text-xs">{comment.likes}</span>
          </button>
          <button
            onClick={() => toast.notImplemented()}
            className="cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setReplying(!replying)}
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            {replying ? "Hủy" : "Trả lời"}
          </button>
          {comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="cursor-pointer flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80"
            >
              {showReplies ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {comment.replies.length} phản hồi
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3 space-y-2">
            {!currentUser && (
              <input
                type="text"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Tên hiển thị (để trống nếu muốn ẩn danh)"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Trả lời ${comment.user}...`}
              rows={2}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setReplying(false);
                  setReplyText("");
                }}
                className="cursor-pointer px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitReply}
                disabled={submitting}
                className="cursor-pointer px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        )}

        {showReplies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l border-border pl-4">
            {comment.replies.map((r) => (
              <div key={r.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-foreground">
                    {r.avatar}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {r.user}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.time}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WatchPage ────────────────────────────────────────────────────────────────

export default function WatchPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const playerRef = useRef(null);

  // ── Save state ─────────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // ─── THÊM STATE (ngay dưới saved/savingLoading state) ────────────────────────
  const [reaction, setReaction] = useState(null); // 'like' | 'dislike' | null
  const [reactionLoading, setReactionLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  // Comment form state
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const [activeServer, setActiveServer] = useState(0);
  const [activeEp, setActiveEp] = useState(null);
  const { isMobile, setMobileOpen, setCollapsed } = useSidebar();

  // ── Kiểm tra phim đã lưu chưa khi load trang ──────────────────────────────
  useEffect(() => {
    if (!user || !slug) return;
    const checkSaved = async () => {
      try {
        const res = await fetch(`/api/user/saved-movies?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setSaved(data.isSaved ?? false);
        }
      } catch {
        // bỏ qua lỗi
      }
    };
    checkSaved();
  }, [user, slug]);

  // ── Xử lý lưu / bỏ lưu phim ───────────────────────────────────────────────
  const handleSave = async () => {
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
            movieName: movie?.title || "",
            movieThumb: movie?.thumbnail || "",
            movieYear: String(movie?.year || ""),
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

  // ─── THÊM useEffect (ngay dưới useEffect kiểm tra saved) ─────────────────────

  // Lấy reaction hiện tại + số lượt của phim khi load trang
  useEffect(() => {
    if (!slug) return;

    // Lấy số lượt like/dislike (không cần đăng nhập)
    const fetchCounts = async () => {
      try {
        const res = await fetch(`/api/movies/${slug}/reactions`);
        if (res.ok) {
          const data = await res.json();
          setLikeCount(data.likeCount ?? 0);
          setDislikeCount(data.dislikeCount ?? 0);
        }
      } catch {
        /* bỏ qua */
      }
    };

    // Lấy reaction của user hiện tại (cần đăng nhập)
    const fetchUserReaction = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/user/liked-movies", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieSlug: slug }),
        });
        if (res.ok) {
          const data = await res.json();
          setReaction(data.reaction ?? null);
        }
      } catch {
        /* bỏ qua */
      }
    };

    fetchCounts();
    fetchUserReaction();
  }, [user, slug]);

  // ─── THÊM HÀM handleReaction ──────────────────────────────────────────────────

  const handleReaction = async (type) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thích phim");
      return;
    }
    if (reactionLoading) return;
    setReactionLoading(true);

    const prevReaction = reaction;
    const prevLike = likeCount;
    const prevDislike = dislikeCount;

    // Optimistic update — cập nhật UI trước
    if (prevReaction === type) {
      // Toggle off
      setReaction(null);
      if (type === "like") setLikeCount((n) => Math.max(0, n - 1));
      else setDislikeCount((n) => Math.max(0, n - 1));
    } else {
      // Đổi hoặc tạo mới
      if (prevReaction === "like") setLikeCount((n) => Math.max(0, n - 1));
      if (prevReaction === "dislike")
        setDislikeCount((n) => Math.max(0, n - 1));
      setReaction(type);
      if (type === "like") setLikeCount((n) => n + 1);
      else setDislikeCount((n) => n + 1);
    }

    try {
      const res = await fetch("/api/user/liked-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieSlug: slug,
          movieName: movie?.title || "",
          movieThumb: movie?.thumbnail || "",
          movieYear: String(movie?.year || ""),
          reaction: type,
        }),
      });

      if (!res.ok) {
        // Rollback nếu lỗi
        setReaction(prevReaction);
        setLikeCount(prevLike);
        setDislikeCount(prevDislike);
        toast.error("Có lỗi xảy ra, thử lại sau");
      }
    } catch {
      // Rollback
      setReaction(prevReaction);
      setLikeCount(prevLike);
      setDislikeCount(prevDislike);
      toast.error("Có lỗi xảy ra, thử lại sau");
    } finally {
      setReactionLoading(false);
    }
  };

  // ── Load comments ──────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!slug) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments/${slug}`);
      const data = await res.json();
      if (res.ok) setComments(data.comments || []);
    } catch {
      // im lặng
    } finally {
      setCommentsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (user?.name) setCommentName(user.name);
  }, [user?.name]);

  // ── Movie data ─────────────────────────────────────────────────────────────
  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movie", slug],
    queryFn: () => fetchMovieDetail(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (movie?.episodes?.[0]?.server_data?.[0]) {
      setActiveServer(0);
      setActiveEp(movie.episodes[0].server_data[0].slug);
    }
  }, [movie?.slug]);

  const currentServer = movie?.episodes?.[activeServer];
  const currentEpIndex = useMemo(() => {
    if (!currentServer) return -1;
    return (
      currentServer.server_data?.findIndex((e) => e.slug === activeEp) ?? -1
    );
  }, [currentServer, activeEp]);
  const currentEp =
    currentEpIndex >= 0
      ? currentServer.server_data[currentEpIndex]
      : currentServer?.server_data?.[0];
  const hasNext =
    currentServer &&
    currentEpIndex >= 0 &&
    currentEpIndex < currentServer.server_data.length - 1;

  const scrollToPlayer = () => {
    if (playerRef.current)
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectEpisode = (epSlug) => {
    setActiveEp(epSlug);
    scrollToPlayer();
  };
  const handleNext = () => {
    if (hasNext) {
      setActiveEp(currentServer.server_data[currentEpIndex + 1].slug);
      scrollToPlayer();
    }
  };

  const primaryGenre = movie?.genre?.[0]?.slug;
  const { data: related } = useQuery({
    queryKey: ["related", primaryGenre || "latest"],
    queryFn: () =>
      primaryGenre
        ? fetchByCategory(primaryGenre, 1, 12).then((d) => d.items)
        : fetchLatest(1),
    enabled: !!movie,
  });
  const relatedList = (related || [])
    .filter((m) => m.slug !== movie?.slug)
    .slice(0, 10);

  // ── Submit comment ─────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!commentText.trim()) {
      toast.warning("Vui lòng nhập nội dung bình luận");
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          guest_name: user ? undefined : commentName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi bình luận thất bại");
      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
    } catch (err) {
      toast.warning(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // ── Reply ──────────────────────────────────────────────────────────────────
  const handleReply = async (commentId, { name, text }) => {
    const res = await fetch(`/api/comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        guest_name: user ? undefined : name || undefined,
        parent_id: commentId,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gửi phản hồi thất bại");
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, data.comment] }
          : c,
      ),
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="aspect-video bg-card rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Không tìm thấy phim</p>
        </div>
      </Layout>
    );
  }

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const handleRelatedClick = () => {
    if (isMobile) setMobileOpen(false);
    else setCollapsed(true);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div
              ref={playerRef}
              className="relative aspect-video bg-black rounded-xl overflow-hidden scroll-mt-16"
            >
              <VideoPlayer
                src={currentEp?.link_m3u8}
                poster={movie.backdrop}
                onNext={handleNext}
                hasNext={hasNext}
              />
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-foreground">
                {movie.title}
              </h1>
              {movie.originName && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {movie.originName}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                {movie.year && <span>{movie.year}</span>}
                {movie.duration && (
                  <>
                    <span>•</span>
                    <span>{movie.duration}</span>
                  </>
                )}
                {movie.episodeCurrent && (
                  <>
                    <span>•</span>
                    <span>{movie.episodeCurrent}</span>
                  </>
                )}
                {movie.quality && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">
                      {movie.quality}
                    </span>
                  </>
                )}
                {movie.rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star
                        className="w-3.5 h-3.5 text-yellow-500"
                        fill="currentColor"
                      />
                      {movie.rating}
                    </span>
                  </>
                )}
              </div>

              {/* ── Nút hành động ── */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => handleReaction("like")}
                  disabled={reactionLoading}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    reaction === "like"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  <ThumbsUp
                    className="w-4 h-4"
                    fill={reaction === "like" ? "currentColor" : "none"}
                  />
                  Thích
                  {likeCount > 0 && (
                    <span className="text-xs opacity-80">
                      {likeCount.toLocaleString()}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleReaction("dislike")}
                  disabled={reactionLoading}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    reaction === "dislike"
                      ? "bg-secondary text-foreground ring-1 ring-border"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  <ThumbsDown
                    className="w-4 h-4"
                    fill={reaction === "dislike" ? "currentColor" : "none"}
                  />
                  {dislikeCount > 0 && (
                    <span className="text-xs opacity-80">
                      {dislikeCount.toLocaleString()}
                    </span>
                  )}
                </button>
                {/* ── Nút Lưu phim ── */}
                <button
                  onClick={handleSave}
                  disabled={savingLoading}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    saved
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  {savingLoading ? (
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    <Bookmark className="w-4 h-4" fill="currentColor" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4" />
                  )}
                  {saved ? "Đã lưu" : "Lưu"}
                </button>
                <button
                  onClick={() => toast.notImplemented()}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-full text-sm text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Chia sẻ
                </button>
              </div>

              <div className="mt-5 p-4 bg-card rounded-xl">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {movie.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {movie.genre.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/genre/${g.slug}`}
                      className="cursor-pointer px-3 py-1 bg-secondary hover:bg-accent rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                  {movie.country.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/country/${c.slug}`}
                      className="cursor-pointer px-3 py-1 bg-secondary hover:bg-accent rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                {movie.director.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">
                      Đạo diễn:{" "}
                    </span>
                    <span className="text-xs text-foreground">
                      {movie.director.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {movie.actor.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Diễn viên
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-row">
                    {movie.actor.map((name, i) => (
                      <button
                        key={i}
                        onClick={() => toast.notImplemented()}
                        className="cursor-pointer flex flex-col items-center gap-1.5 shrink-0 w-20 group"
                      >
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:ring-2 ring-primary transition-all">
                          <span className="text-lg font-semibold text-foreground">
                            {name.split(" ").pop()?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground text-center line-clamp-2 group-hover:text-foreground transition-colors">
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {movie.episodes.length > 0 &&
              movie.episodes[0].server_data?.length > 0 && (
                <div className="mt-6">
                  {movie.episodes.length > 1 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {movie.episodes.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveServer(i)}
                          className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                            i === activeServer
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {s.server_name}
                        </button>
                      ))}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Danh sách tập
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-1">
                    {movie.episodes[activeServer]?.server_data?.map((ep) => (
                      <button
                        key={ep.slug}
                        onClick={() => selectEpisode(ep.slug)}
                        className={cn(
                          "cursor-pointer px-2 py-2 rounded-lg text-xs font-medium transition-colors truncate",
                          ep.slug === activeEp
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-accent",
                        )}
                      >
                        Tập {ep.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* ── Comments ── */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {commentsLoading
                    ? "Đang tải..."
                    : `${comments.length} bình luận`}
                </h2>
              </div>

              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  {user ? (
                    <span className="text-sm font-semibold text-primary">
                      {user.name[0].toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {!user && (
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Tên hiển thị (để trống nếu muốn ẩn danh)"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                  {user && (
                    <p className="text-xs text-muted-foreground">
                      Bình luận với tên{" "}
                      <span className="text-foreground font-medium">
                        {user.name}
                      </span>
                    </p>
                  )}
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận..."
                    rows={2}
                    className="w-full bg-transparent border-b border-border pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                  {commentText && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setCommentText("")}
                        className="cursor-pointer px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={submitComment}
                        disabled={submittingComment}
                        className="cursor-pointer px-4 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
                      >
                        {submittingComment ? "Đang gửi..." : "Bình luận"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {visibleComments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    currentUser={user}
                    onReply={handleReply}
                  />
                ))}
                {!commentsLoading && comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </p>
                )}
              </div>

              {comments.length > 3 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="cursor-pointer flex items-center gap-2 mt-5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  {showAllComments ? (
                    <>
                      Ẩn bớt <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Xem thêm bình luận <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full xl:w-[360px] shrink-0">
            {movie.trailerUrl && (
              <>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Trailer
                </h3>
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer flex gap-3 group hover:bg-card rounded-lg p-2 transition-colors mb-4"
                >
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.thumbnail}
                      alt="trailer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                      <Play
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      Xem trailer trên YouTube
                    </h4>
                  </div>
                </a>
              </>
            )}

            <h3 className="text-sm font-semibold text-foreground mb-2">
              Phim liên quan
            </h3>
            <div className="space-y-2">
              {relatedList.map((m) => (
                <Link
                  key={m.slug}
                  href={`/watch/${m.slug}`}
                  onClick={handleRelatedClick}
                  className="cursor-pointer flex gap-3 group hover:bg-card rounded-lg p-2 transition-colors"
                >
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.thumbnail}
                      alt={m.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {m.quality && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                        {m.quality}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {m.title}
                    </h4>
                    {m.originName && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {m.originName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {m.year && <span>{m.year}</span>}
                      {m.episodeCurrent && (
                        <span className="truncate">• {m.episodeCurrent}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {!relatedList.length && (
                <div className="text-xs text-muted-foreground p-2">
                  Đang tải phim liên quan...
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
