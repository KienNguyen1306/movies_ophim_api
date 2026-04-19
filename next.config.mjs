/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // img.ophim.live vẫn cần vì ảnh được load trực tiếp bởi <Image>
      { protocol: "https", hostname: "img.ophim.live" },
      // ophim1.com đã bị xóa — không còn gọi trực tiếp từ client
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
