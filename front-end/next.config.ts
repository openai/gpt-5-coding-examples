import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

function detectPublicSlugs(): string[] {
  try {
    const publicDir = path.join(__dirname, "public");
    const entries = fs.readdirSync(publicDir, { withFileTypes: true });
    return entries
      .filter(
        (e) =>
          e.isDirectory() &&
          fs.existsSync(path.join(publicDir, e.name, "index.html"))
      )
      .map((e) => e.name);
  } catch {
    return [];
  }
}

const slugs = detectPublicSlugs();

const nextConfig: NextConfig = {
  output: "export",
  async rewrites() {
    // Allow pretty URLs in dev by serving /slug -> /slug/index.html
    return slugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/${slug}/index.html`,
    }));
  },
  // Optional: if you ever add next/image back, uncomment below
  // images: { unoptimized: true },
};

export default nextConfig;
