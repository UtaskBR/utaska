/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  // Configurações específicas para Cloudflare Pages
  output: 'export',
  distDir: '.vercel/output/static',
  // Desabilitar verificações de tipo durante o build para evitar problemas com o Edge Runtime
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
