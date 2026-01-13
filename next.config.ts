import type { NextConfig } from "next";
// import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {}
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
//     {
//       urlPattern: /\.(?:jpg|jpeg|png|gif|webp|svg)$/i,
//       handler: "NetworkFirst",
//       options: {
//         cacheName: "images-cache",
//         expiration: {
//           maxEntries: 60,
//           maxAgeSeconds: 30 * 24 * 60 * 60
//         }
//       }
//     }
//   ]
// })(nextConfig);

export default nextConfig;
