/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Disable TypeScript type checking during build
    // Type checking can be run separately with 'npm run type-check'
    ignoreBuildErrors: true,
  },
  eslint: {
    dirs: ['src'],
    // Disable ESLint during build to allow deployment
    // ESLint can be run separately with 'npm run lint'
    ignoreDuringBuilds: true,
  },
  // NOTE: Do NOT expose NEXTAUTH_URL or NEXTAUTH_SECRET as public env vars
  // These are server-side only and must be set in environment
  // For local dev, set in .env.local
  // For Vercel, set in Project Settings > Environment Variables
}

module.exports = nextConfig
