import type { MetadataRoute } from 'next'
import { obtenerProductos } from '@/lib/catalogo'
import { SITIO_URL } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos()

  const fijas: MetadataRoute.Sitemap = [
    { url: SITIO_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITIO_URL}/catalogo`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITIO_URL}/combos`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITIO_URL}/nosotros`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITIO_URL}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITIO_URL}/terminos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITIO_URL}/privacidad`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const fichas: MetadataRoute.Sitemap = productos.map((producto) => ({
    url: `${SITIO_URL}/producto/${producto.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...fijas, ...fichas]
}
