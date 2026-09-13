import Image from 'next/image'
import Link from 'next/link'
import { Leaf, HandHeart, Sparkles, ArrowRight } from 'lucide-react'
import { TarjetaProducto } from '@/components/tarjeta-producto'
import { obtenerProductos, obtenerDestacados } from '@/lib/catalogo'
import {
  contarRecetas,
  ingredientesDestacados,
  textoDesde,
} from '@/lib/textos'
import { NEGOCIO, SITIO_URL } from '@/lib/config'

const VALORES = [
  {
    icono: HandHeart,
    titulo: 'Hechos a mano',
    texto: 'En tandas pequeñas, uno por uno, en nuestra casa en Bogotá.',
  },
  {
    icono: Leaf,
    titulo: 'Ingredientes naturales',
    texto: 'Nada en la etiqueta que no puedas reconocer y nombrar.',
  },
  {
    icono: Sparkles,
    titulo: 'Sin químicos agresivos',
    texto: 'Base de glicerina vegetal que limpia sin dejar la piel tirante.',
  },
]

function DatosEstructurados() {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: NEGOCIO.nombre,
    description: NEGOCIO.descripcion,
    image: `${SITIO_URL}/hero-familia.jpg`,
    url: SITIO_URL,
    telephone: `+${NEGOCIO.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: NEGOCIO.ciudad,
      addressCountry: 'CO',
    },
    areaServed: { '@type': 'City', name: NEGOCIO.ciudad },
    priceRange: '$5.000 - $7.500 COP',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  )
}

/** El catálogo vive en la base de datos: se refresca solo cada 5 minutos
 *  y al instante cuando el panel guarda un cambio. */
export const revalidate = 300

export default async function Portada() {
  const productos = await obtenerProductos()
  const destacados = (await obtenerDestacados()).slice(0, 3)

  const recetas = contarRecetas(productos.length)
  const ingredientes = ingredientesDestacados(productos)
  const desde = textoDesde(productos)

  return (
    <>
      <DatosEstructurados />

      {/* ---------- Portada ---------- */}
      <section className="relative overflow-hidden border-b border-linea bg-crema-hondo">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_1.15fr] lg:py-16">
          <div className="flex flex-col items-start gap-5">
            <span className="versalita rounded-full bg-rosa-suave px-3.5 py-1.5 text-rosa-hondo">
              Artesanal · Bogotá
            </span>
            <h1 className="text-[clamp(2.5rem,7vw,4rem)] leading-[0.98]">
              Jabones que se hacen
              <br />
              <em className="text-rosa-hondo">con el alma</em>
            </h1>
            <p className="max-w-md text-[1.05rem] text-tinta-media">
              {recetas.charAt(0).toUpperCase() + recetas.slice(1)} de glicerina
              artesanal con {ingredientes}. Hechos a mano, en tandas pequeñas,
              para piel que agradece lo simple.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/catalogo"
                className="rounded-full bg-rosa px-7 py-3.5 font-semibold text-white shadow-tarjeta transition hover:bg-rosa-hondo"
              >
                Ver el catálogo
              </Link>
              <Link
                href="/nosotros"
                className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte px-6 py-3.5 font-semibold text-tinta transition hover:border-rosa hover:text-rosa-hondo"
              >
                Cómo los hacemos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="cifra text-sm text-tinta-tenue">
              {desde ? `${desde.charAt(0).toUpperCase()}${desde.slice(1)} · ` : ''}
              Pedidos por WhatsApp
            </p>
          </div>

          <div className="relative overflow-hidden rounded-tarjeta shadow-elevada">
            <Image
              src="/hero-familia.jpg"
              alt="Jabones artesanales de Mari sobre una tabla de mármol, rodeados de romero, arroz, avena y naranja"
              width={1376}
              height={768}
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- Valores ---------- */}
      <section aria-label="Por qué nuestros jabones" className="mx-auto max-w-6xl px-4 py-12">
        <ul className="grid gap-6 sm:grid-cols-3">
          {VALORES.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-salvia-suave text-salvia">
                <Icono className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-sans)] text-[0.95rem] font-bold">
                  {titulo}
                </h2>
                <p className="mt-0.5 text-sm text-tinta-media">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Destacados ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,2.4rem)]">Los más pedidos</h2>
            <p className="mt-1 text-tinta-media">
              Los tres que siempre se acaban primero.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rosa-hondo hover:underline"
          >
            Ver el catálogo completo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((producto, i) => (
            <TarjetaProducto key={producto.id} producto={producto} prioridad={i === 0} />
          ))}
        </div>
      </section>

      {/* ---------- Proceso ---------- */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid items-center gap-8 overflow-hidden rounded-tarjeta border border-linea bg-white shadow-tarjeta md:grid-cols-2">
          <Image
            src="/proceso-artesanal.jpg"
            alt="Manos vertiendo glicerina líquida en moldes de corazón sobre un mesón de madera, rodeadas de cuencos con avena, arroz y romero"
            width={1264}
            height={848}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
          <div className="flex flex-col items-start gap-4 p-7 md:p-10">
            <span className="versalita text-rosa-hondo">Nuestro proceso</span>
            <h2 className="text-[clamp(1.7rem,4vw,2.3rem)] leading-tight">
              Uno por uno, en la cocina de casa
            </h2>
            <p className="text-tinta-media">
              Derretimos la base de glicerina vegetal, la mezclamos con el
              ingrediente de cada receta y la vertemos en los moldes a mano.
              Cada tanda sale distinta: el romero queda en un lugar diferente,
              la cúrcuma se vetea a su manera. Por eso ningún jabón es idéntico
              a otro.
            </p>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-1.5 font-semibold text-rosa-hondo hover:underline"
            >
              Conoce la historia
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Regalo ---------- */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid items-center gap-8 rounded-tarjeta bg-rosa-niebla p-7 md:grid-cols-2 md:p-10">
          <div className="flex flex-col items-start gap-4">
            <span className="versalita text-rosa-hondo">Detalles y combos</span>
            <h2 className="text-[clamp(1.7rem,4vw,2.3rem)] leading-tight">
              Un jabón también es un buen regalo
            </h2>
            <p className="text-tinta-media">
              Armamos combos de tres y sets de regalo con bolsa de organza y
              tarjeta. Ideales para detalles de cumpleaños, agradecimientos y
              recordatorios de eventos.
            </p>
            <Link
              href="/combos"
              className="rounded-full bg-tinta px-6 py-3 font-semibold text-crema transition hover:bg-rosa-hondo"
            >
              Ver combos
            </Link>
          </div>
          <Image
            src="/productos/detalle-regalo.jpg"
            alt="Set de regalo con tres jabones pequeños de colores dentro de una bolsa de organza rosa con cinta de satén"
            width={900}
            height={900}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 45vw"
            className="w-full rounded-suave object-cover shadow-tarjeta"
          />
        </div>
      </section>
    </>
  )
}
