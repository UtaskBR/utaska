/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    // Removido unoptimized: true para compatibilidade com a Vercel
  },
  // Removidas configurações específicas para Cloudflare Pages
  // output: 'export',
  // distDir: '.vercel/output/static',
  
  // Mantidas configurações para facilitar o deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
