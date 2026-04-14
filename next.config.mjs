/** @type {import('next').NextConfig} */

// CSP is handled dynamically in src/middleware.ts (nonce-based, per-request).
// Static security headers that do not require a nonce live here.
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // #22 — extended Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), display-capture=()',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // #23 — prevents cross-origin window attacks (Spectre, opener hijack)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // #24 — prevents other origins from embedding our resources
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;