import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent folder is not picked up.
  turbopack: { root: path.resolve(import.meta.dirname) },
}

export default nextConfig
