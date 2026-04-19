# CineTube — Next.js 15

Phiên bản Next.js (App Router) đã được chuyển đổi từ bản Vite/React.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Build production

```bash
npm run build
npm start
```

## Stack

- Next.js 15 (App Router) + React 19
- TanStack React Query v5
- Tailwind CSS v4
- hls.js cho video player
- lucide-react cho icon
- Auth tạm dùng localStorage (giống bản Vite)

## Cấu trúc

```
src/
  app/                    # File-based routing
    layout.jsx            # Root layout
    providers.jsx         # Client providers (QueryClient, Auth, Sidebar, Toast)
    page.jsx              # Trang chủ /
    watch/[slug]/page.jsx
    list/[slug]/page.jsx
    genre/[slug]/page.jsx
    country/[slug]/page.jsx
    search/page.jsx
    login/page.jsx
    signup/page.jsx
    not-found.jsx
    globals.css
  components/             # UI components
  contexts/               # React contexts
  lib/                    # OPhim API client + utils
  hooks/                  # Custom hooks
```
