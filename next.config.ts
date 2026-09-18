import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      // Real article images — confirmed live, this is where the backend's uploaded/CDN images
      // actually resolve from (see POST /articles/images and the featuredImage on GET /articles/:slug).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // The CMS editor's "search media library" insert action — a placeholder source, not real
      // production images, but it does render through next/image in the editor preview.
      { protocol: "https", hostname: "picsum.photos" },
      // YouTube video thumbnails — used when a featured/OG image is a pasted
      // video thumbnail URL rather than an uploaded article image.
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
