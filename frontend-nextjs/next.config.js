/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creatorbase-backend.onrender.com/api',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '852792982943-iadr4llqoiigtpkqc2blcfq25q00plv6.apps.googleusercontent.com',
  },
}

module.exports = nextConfig 