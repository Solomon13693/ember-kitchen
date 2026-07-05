import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.themealdb.com" },
      { protocol: "https", hostname: "www.thecocktaildb.com" },
    ],
  },
};

export default nextConfig;
