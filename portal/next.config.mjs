/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCljWSzB-Nzflfd8Pp3Y9OuvMZH9iDdGdI",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "up365-d9e54.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "up365-d9e54",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "up365-d9e54.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "768633978530",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:768633978530:web:8e90112b03efbd666821fb",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-NS1KBRCXX9",
    NEXT_PUBLIC_ADMIN_EMAIL: "xsavtechnology@gmail.com",
  },
};

export default withPWA(nextConfig);
