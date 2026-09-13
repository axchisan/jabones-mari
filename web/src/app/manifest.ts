import type { MetadataRoute } from 'next'
import { NEGOCIO } from '@/lib/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${NEGOCIO.nombre} · ${NEGOCIO.tagline}`,
    short_name: NEGOCIO.nombreCorto,
    description: NEGOCIO.descripcion,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fcf8f4',
    theme_color: '#e07fae',
    lang: 'es-CO',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Ver el catálogo',
        short_name: 'Catálogo',
        url: '/catalogo',
      },
      {
        name: 'Mi carrito',
        short_name: 'Carrito',
        url: '/pedido',
      },
    ],
  }
}
