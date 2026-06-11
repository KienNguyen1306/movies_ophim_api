"use client";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/contexts/SidebarContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useToast } from "@/contexts/ToastContext.jsx";
import { searchMovies } from "@/lib/ophim.js";

export function Header() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { isMobile, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const toast = useToast();
  const wrapperRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggest", debounced],
    queryFn: () => searchMovies(debounced, 1, 6),
    enabled: debounced.length > 1,
  });
  const results = (data?.items || []).slice(0, 6);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (slug) => {
    setShowDropdown(false);
    setQuery("");
    if (isMobile) setMobileOpen(false);
    else setCollapsed(true);
    router.push(`/watch/${slug}`);
  };

  const handleToggleSidebar = () => {
    if (isMobile) setMobileOpen(true);
    else setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success("Đã đăng xuất");
    router.push("/");
  };

  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border h-14 flex items-center px-4 gap-4">
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleToggleSidebar}
          className="cursor-pointer p-2 rounded-full hover:bg-accent transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <Link href="/" className="cursor-pointer flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <span className="text-foreground font-bold text-xl hidden sm:block">
            CineTube
          </span>
        </Link>
      </div>

      <form
        ref={wrapperRef}
        onSubmit={handleSearch}
        className="flex-1 max-w-xl mx-auto relative"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Tìm phim, diễn viên..."
            className="w-full bg-secondary border border-border rounded-full py-2 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
              }}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {showDropdown && debounced.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
            {isFetching && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Đang tìm...
              </div>
            )}
            {results.map((movie) => (
              <button
                key={movie.slug}
                type="button"
                onClick={() => handleSelect(movie.slug)}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-12 h-7 rounded object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {movie.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {movie.year}{" "}
                    {movie.episodeCurrent ? `· ${movie.episodeCurrent}` : ""}
                  </p>
                </div>
              </button>
            ))}
            {results.length > 0 && (
              <button
                type="submit"
                className="cursor-pointer w-full px-4 py-2.5 text-sm text-primary hover:bg-accent transition-colors text-left font-medium border-t border-border"
              >
                Xem tất cả kết quả cho "{query}"
              </button>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toast.notImplemented()}
          className="cursor-pointer p-2 rounded-full hover:bg-accent transition-colors relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="cursor-pointer w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
              title={user.name}
            >
              <span className="text-primary-foreground font-semibold text-sm">
                {initial}
              </span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => {
                    setShowUserMenu(false);
                    // toast.notImplemented();
                  }}
                  className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left"
                >
                  <User className="w-4 h-4" /> Trang cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left border-t border-border"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng ký</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
