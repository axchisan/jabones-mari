import type { MetadataRoute } from 'next'
import { SITIO_URL } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/', '/pedido', '/baja', '/verificar'],
    },
    sitemap: `${SITIO_URL}/sitemap.xml`,
    host: SITIO_URL,
  }
}
