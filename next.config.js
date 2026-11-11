const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  // experimental: {
  //   outputFileTracingRoot: path.join(__dirname, '../'),
  // },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { dev }) => {
    // Prevent intermittent Windows dev cache corruption (.next/server/vendor-chunks missing)
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: { unoptimized: true },
  async headers() {
    // A API so e usada pelo proprio site (mesma origem), entao nao precisa de
    // CORS aberto. Antes, qualquer site podia chamar /api com credenciais.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


