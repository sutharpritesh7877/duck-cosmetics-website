/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.VITE_FIREBASE_API_KEY ||
      'AIzaSyBv6mfcawOiiAkIZFEW6fjaP-w9ZDHpWsU',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      process.env.VITE_FIREBASE_AUTH_DOMAIN ||
      'duck-cosmetics-a4f4b.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      'duck-cosmetics-a4f4b',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      'duck-cosmetics-a4f4b.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      '440189309657',
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
      process.env.VITE_FIREBASE_APP_ID ||
      '1:440189309657:web:6cbb4a7814c0af5b0224c8',
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      'fddgundt',
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      'duck_unsigned_preset',
    DEFAULT_ADMIN_EMAIL:
      process.env.ADMIN_EMAIL ||
      process.env.DEFAULT_ADMIN_EMAIL ||
      process.env.VITE_ADMIN_EMAIL ||
      'sutharpritesh7877@gmail.com',
    DEFAULT_ADMIN_PASSWORD:
      process.env.ADMIN_PASSWORD ||
      process.env.DEFAULT_ADMIN_PASSWORD ||
      process.env.VITE_ADMIN_PASSWORD ||
      'Ram@7877545471',
    ADMIN_EMAIL:
      process.env.ADMIN_EMAIL ||
      process.env.DEFAULT_ADMIN_EMAIL ||
      process.env.VITE_ADMIN_EMAIL ||
      'sutharpritesh7877@gmail.com',
    ADMIN_PASSWORD:
      process.env.ADMIN_PASSWORD ||
      process.env.DEFAULT_ADMIN_PASSWORD ||
      process.env.VITE_ADMIN_PASSWORD ||
      'Ram@7877545471',
  },
};

export default nextConfig;
