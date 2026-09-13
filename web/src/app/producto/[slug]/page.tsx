import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { SelectorCompra } from '@/components/selector-compra'
import { TarjetaProducto } from '@/components/tarjeta-producto'
import { obtenerProducto, obtenerProductos } from '@/lib/catalogo'
import { NEGOCIO, SITIO_URL } from '@/lib/config'

export async function generateStaticParams() {
  const productos = await obtenerProductos()
  return productos.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const producto = await obtenerProducto(slug)
  if (!producto) return { title: 'Jabón no encontrado' }

  const titulo = `Jabón de ${producto.nombre} artesanal`
  const descripcion = `${producto.beneficios.slice(0, 3).join(', ')}. Hecho a mano con ingredientes naturales. Grande $7.500 · Pequeño $5.000.`

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${producto.slug}` },
    openGraph: {
      title: `${titulo} · ${NEGOCIO.nombre}`,
      description: descripcion,
      images: [{ url: producto.imagenes[0].url, alt: producto.imagenes[0].alt }],
    },
  }
}

export default async function FichaProducto({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const producto = await obtenerProducto(slug)
  if (!producto) notFound()

  const todos = await obtenerProductos()
  const relacionados = todos.filter((p) => p.slug !== producto.slug).slice(0, 3)

  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Jabón artesanal de ${producto.nombre}`,
    description: producto.descripcion,
    image: producto.imagenes.map((i) => `${SITIO_URL}${i.url}`),
    brand: { '@type': 'Brand', name: NEGOCIO.nombreCorto },
    category: 'Jabón artesanal',
    offers: producto.variantes.map((v) => ({
      '@type': 'Offer',
      name: v.tamano === 'grande' ? 'Tamaño grande' : 'Tamaño pequeño',
      sku: v.sku,
      price: v.precio,
      priceCurrency: 'COP',
      availability: v.disponible
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITIO_URL}/producto/${producto.slug}`,
      areaServed: NEGOCIO.ciudad,
    })),
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
      />

      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-tinta-media transition hover:text-rosa-hondo"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Imágenes */}
        <div className="flex flex-col gap-3">
          <Image
            src={producto.imagenes[0].url}
            alt={producto.imagenes[0].alt}
            width={1000}
            height={1000}
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full rounded-tarjeta bg-white object-cover shadow-tarjeta"
          />
          {producto.imagenes.length > 1 && (
            <div className="grid grid-cols-2 gap-3">
              {producto.imagenes.slice(1).map((imagen) => (
                <Image
                  key={imagen.url}
                  src={imagen.url}
                  alt={imagen.alt}
                  width={600}
                  height={750}
                  loading="lazy"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="w-full rounded-suave bg-white object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <span
              className="versalita w-fit rounded-full px-3 py-1 text-white"
              style={{ backgroundColor: producto.colorMarca }}
            >
              {producto.claim}
            </span>
            <h1 className="text-[clamp(2.2rem,6vw,3rem)] leading-[1.02]">
              {producto.nombre}
            </h1>
            <p className="text-[1.05rem] text-tinta-media">{producto.descripcion}</p>
          </div>

          <SelectorCompra producto={producto} />

          {producto.advertencia && (
            <p className="flex items-start gap-2.5 rounded-suave border border-linea-fuerte bg-crema-hondo px-4 py-3 text-sm text-tinta-media">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-dorado"
                aria-hidden="true"
              />
              {producto.advertencia}
            </p>
          )}

          <section>
            <h2 className="versalita mb-3 font-[family-name:var(--font-sans)] text-tinta-tenue">
              Beneficios
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {producto.beneficios.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-2 text-[0.95rem]">
                  <Check
                    className="mt-1 size-3.5 shrink-0 text-salvia"
                    aria-hidden="true"
                  />
                  {beneficio}
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-5 sm:grid-cols-2">
            <section>
              <h2 className="versalita mb-2 font-[family-name:var(--font-sans)] text-tinta-tenue">
                Ingredientes
              </h2>
              <ul className="flex flex-col gap-1 text-[0.95rem] text-tinta-media">
                {producto.ingredientes.map((ingrediente) => (
                  <li key={ingrediente}>{ingrediente}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="versalita mb-2 font-[family-name:var(--font-sans)] text-tinta-tenue">
                Ficha
              </h2>
              <dl className="flex flex-col gap-1 text-[0.95rem]">
                <div className="flex gap-2">
                  <dt className="text-tinta-tenue">Piel:</dt>
                  <dd>{producto.tipoDePiel.join(', ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-tinta-tenue">Uso:</dt>
                  <dd>{producto.uso.join(' y ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-tinta-tenue">Aroma:</dt>
                  <dd>{producto.aroma}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="rounded-suave bg-salvia-suave px-5 py-4">
            <h2 className="versalita mb-1.5 font-[family-name:var(--font-sans)] text-salvia">
              Modo de uso
            </h2>
            <p className="text-[0.95rem] text-tinta-media">{producto.modoDeUso}</p>
          </section>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-[clamp(1.6rem,4vw,2.1rem)]">También te puede gustar</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((otro) => (
              <TarjetaProducto key={otro.id} producto={otro} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
