/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
