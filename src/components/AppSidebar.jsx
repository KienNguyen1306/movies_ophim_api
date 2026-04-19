"use client";
import {
  Home,
  Flame,
  X,
  Film,
  Globe,
  ChevronDown,
  Clapperboard,
  Tv,
  Sparkles,
  CalendarClock,
  Subtitles,
  Mic,
  AudioLines,
  PlayCircle,
  CheckCircle2,
  Users,
  Projector,
  Folder,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils.js";
import { useSidebar } from "@/contexts/SidebarContext.jsx";
import { fetchCategories, fetchCountries } from "@/lib/ophim.js";

const menuItems = [
  { label: "Trang chủ", icon: Home, path: "/" },
  { label: "Phim Mới Cập Nhật", icon: Flame, path: "/list/phim-moi-cap-nhat" },
  { label: "Phim Lẻ", icon: Clapperboard, path: "/list/phim-le" },
  { label: "Phim Bộ", icon: Tv, path: "/list/phim-bo" },
  { label: "TV Shows", icon: Tv, path: "/list/tv-shows" },
  { label: "Hoạt Hình", icon: Sparkles, path: "/list/hoat-hinh" },
  { label: "Phim Vietsub", icon: Subtitles, path: "/list/phim-vietsub" },
  { label: "Phim Thuyết Minh", icon: Mic, path: "/list/phim-thuyet-minh" },
  { label: "Phim Lồng Tiếng", icon: AudioLines, path: "/list/phim-long-tieng" },
  {
    label: "Phim Bộ Đang Chiếu",
    icon: PlayCircle,
    path: "/list/phim-bo-dang-chieu",
  },
  {
    label: "Phim Bộ Hoàn Thành",
    icon: CheckCircle2,
    path: "/list/phim-bo-hoan-thanh",
  },
  {
    label: "Phim Sắp Chiếu",
    icon: CalendarClock,
    path: "/list/phim-sap-chieu",
  },
  { label: "Subteam", icon: Users, path: "/list/subteam" },
  { label: "Phim Chiếu Rạp", icon: Projector, path: "/list/phim-chieu-rap" },
];

function NavItem({ href, icon: Icon, label, showLabel, exact }) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-sidebar-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {showLabel && <span>{label}</span>}
    </Link>
  );
}

function GroupLink({ href, name, Icon }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-sidebar-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : (
        <span className="w-4 h-4 shrink-0" />
      )}
      <span className="truncate">{name}</span>
    </Link>
  );
}

function CollapsibleGroup({ label, items, getPath, icon: Icon, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 6);

  return (
    <div className="pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1 group"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open && (
        <div className="mt-1 max-h-[252px] overflow-y-auto pr-1">
          {visible.map((c) => (
            <GroupLink
              key={c.slug}
              href={getPath(c.slug)}
              name={c.name}
              Icon={Icon}
            />
          ))}
          {items.length > 6 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left px-3 py-1.5 text-xs text-primary hover:text-primary/80 font-medium"
            >
              {expanded ? "Thu gọn" : `Xem thêm (${items.length - 6})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } =
    useSidebar();
  const pathname = usePathname();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith("/watch")) {
      if (isMobile) setMobileOpen(false);
      else setCollapsed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const showLabels = isMobile ? true : !collapsed;

  const sidebarContent = (
    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
      {menuItems.map((item) => (
        <NavItem
          key={item.path}
          href={item.path}
          icon={item.icon}
          label={item.label}
          showLabel={showLabels}
          exact={item.path === "/"}
        />
      ))}

      {showLabels && (
        <>
          <CollapsibleGroup
            label="Thể loại"
            items={categories}
            getPath={(s) => `/genre/${s}`}
            icon={Film}
            defaultOpen
          />
          <CollapsibleGroup
            label="Quốc gia"
            items={countries}
            getPath={(s) => `/country/${s}`}
            icon={Globe}
            defaultOpen
          />
        </>
      )}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-border transition-transform duration-300 flex flex-col pt-14",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-3 p-1 rounded-full hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-40 bg-sidebar border-r border-border transition-all duration-300 overflow-hidden flex flex-col",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {sidebarContent}
    </aside>
  );
}
