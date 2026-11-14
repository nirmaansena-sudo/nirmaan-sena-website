import { networkInterfaces } from 'node:os';

const isDev = process.env.NODE_ENV !== 'production';

// Phone/tablet previews use this computer's Wi-Fi address, not localhost.
// Next's dev debug stream must be allowed from that exact host for hydration.
// Only allow private IPv4 addresses actually assigned to this computer.
const localDevHosts = isDev
  ? Object.values(networkInterfaces()).flat().filter((address) =>
      address?.family === 'IPv4' && !address.internal &&
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address)
    ).map((address) => address.address)
  : [];

// Content Security Policy: only this site and the services it actually uses may load content.
// Next.js needs 'unsafe-inline' for its own inline scripts; 'unsafe-eval' and websockets are dev-only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.googleusercontent.com https://i.ytimg.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.cloudinary.com${isDev ? ' ws: wss:' : ''}`,
  'frame-src https://www.youtube-nocookie.com https://www.google.com https://maps.google.com',
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', ...new Set(localDevHosts)],
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['mongodb'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
