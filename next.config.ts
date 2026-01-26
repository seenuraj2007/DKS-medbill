import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true
      }
    ]
  }
};

// Temporarily disabled PWA config due to type conflicts
// export default withPWA({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
//   sw: "service-worker.js",
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "google-fonts-cache",
//         expiration: {
//           maxEntries: 4,
//           maxAgeSeconds: 365 * 24 * 60 * 60
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:eot|otf|ttc|ttf|woff)$/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "static-fonts-cache",
//         expiration: {
//           maxEntries: 4,
//           maxAgeSeconds: 7 * 24 * 60 * 60
//         }
//       }
//     },
//       {
//         urlPattern: /\.(?:jpg|jpeg|png|gif|webp|svg)$/i,
//         handler: "NetworkFirst",
//         options: {
//           cacheName: "images-cache",
//           expiration: {
//             maxEntries: 60,
//             maxAgeSeconds: 30 * 24 * 60 * 60
//           }
//         }
//       }
//     ]
//   ]
// })(nextConfig);

export default nextConfig;
