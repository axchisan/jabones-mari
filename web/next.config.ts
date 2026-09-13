import type { NextConfig } from 'next'

/** Las fotos que se suben desde el panel viven en Cloudflare R2. */
const anfitrionR2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
  : 'pub-b72dc903052b4dc594126e2f2b0799bb.r2.dev'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: anfitrionR2, pathname: '/**' }],
    formats: ['image/avif', 'image/webp'],
  },

  // Cabeceras de seguridad. La política de contenido no se define aquí porque
  // Next inyecta estilos y scripts propios; se ajusta al desplegar si hace falta.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // El panel y la API nunca deben quedar en cachés intermedias.
  poweredByHeader: false,
}

export default nextConfig
