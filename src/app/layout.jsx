import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "CineTube — Xem phim online",
  description: "Xem phim online miễn phí, chất lượng cao",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
