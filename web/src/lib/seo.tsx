import { NEGOCIO, SITIO_URL } from '@/lib/config'
import type { Producto } from '@/lib/tipos'

/**
 * Datos estructurados (JSON-LD).
 *
 * Es lo que hace que Google muestre precio y disponibilidad directo en los
 * resultados, y lo que da las migas de pan bajo el título. Gratis y de alto
 * impacto para una tienda pequeña.
 */

type Json = Record<string, unknown>

export function negocioLocal(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITIO_URL}/#negocio`,
    name: NEGOCIO.nombre,
    alternateName: NEGOCIO.nombreCorto,
    slogan: NEGOCIO.tagline,
    description: NEGOCIO.descripcion,
    image: `${SITIO_URL}/hero-familia.jpg`,
    logo: `${SITIO_URL}/icons/icon-512.png`,
    url: SITIO_URL,
    telephone: `+${NEGOCIO.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: NEGOCIO.ciudad,
      addressCountry: 'CO',
    },
    areaServed: { '@type': 'City', name: NEGOCIO.ciudad },
    currenciesAccepted: 'COP',
    priceRange: '$$',
  }
}

export function sitioWeb(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITIO_URL}/#sitio`,
    name: NEGOCIO.nombre,
    url: SITIO_URL,
    inLanguage: 'es-CO',
    publisher: { '@id': `${SITIO_URL}/#negocio` },
  }
}

export function migasDePan(pasos: { nombre: string; ruta: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pasos.map((paso, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: paso.nombre,
      item: `${SITIO_URL}${paso.ruta}`,
    })),
  }
}

export function fichaDeProducto(producto: Producto): Json {
  const disponibles = producto.variantes.filter((v) => v.disponible)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Jabón artesanal de ${producto.nombre}`,
    description: producto.descripcion,
    image: producto.imagenes.map((i) =>
      i.url.startsWith('http') ? i.url : `${SITIO_URL}${i.url}`,
    ),
    brand: { '@type': 'Brand', name: NEGOCIO.nombreCorto },
    category: 'Salud y belleza > Cuidado personal > Jabón',
    ...(producto.aroma ? { additionalProperty: [
      { '@type': 'PropertyValue', name: 'Aroma', value: producto.aroma },
    ] } : {}),
    offers: producto.variantes.map((variante) => ({
      '@type': 'Offer',
      name: variante.tamano === 'grande' ? 'Tamaño grande' : 'Tamaño pequeño',
      sku: variante.sku,
      price: variante.precio,
      priceCurrency: 'COP',
      availability: variante.disponible
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITIO_URL}/producto/${producto.slug}`,
      seller: { '@id': `${SITIO_URL}/#negocio` },
      areaServed: NEGOCIO.ciudad,
      ...(variante.pesoGramos
        ? { weight: { '@type': 'QuantitativeValue', value: variante.pesoGramos, unitCode: 'GRM' } }
        : {}),
    })),
    ...(disponibles.length === 0 ? { availability: 'https://schema.org/OutOfStock' } : {}),
  }
}

export function preguntasFrecuentes(
  preguntas: { pregunta: string; respuesta: string }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
      '@type': 'Question',
      name: pregunta,
      acceptedAnswer: { '@type': 'Answer', text: respuesta },
    })),
  }
}

/** Inserta el JSON-LD en la página. */
export function DatosEstructurados({ datos }: { datos: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  )
}
