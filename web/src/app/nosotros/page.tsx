import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NEGOCIO } from '@/lib/config'
import { obtenerProductos } from '@/lib/catalogo'
import { contarRecetas } from '@/lib/textos'

export const metadata: Metadata = {
  title: 'Nuestra historia',
  description:
    'Un emprendimiento familiar bogotano. Cada jabón se hace en casa, en tandas pequeñas, con ingredientes naturales.',
  alternates: { canonical: '/nosotros' },
}

/** El catálogo vive en la base de datos: se refresca solo cada 5 minutos
 *  y al instante cuando el panel guarda un cambio. */
export const revalidate = 300

export default async function Nosotros() {
  const productos = await obtenerProductos()
  const recetas = contarRecetas(productos.length)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="versalita text-rosa-hondo">Nuestra historia</span>
        <h1 className="text-[clamp(2.2rem,6vw,3.2rem)] leading-[1.03]">
          Empezó por curiosidad, siguió por cariño
        </h1>
      </header>

      <Image
        src="/proceso-artesanal.jpg"
        alt="Manos vertiendo glicerina líquida en moldes de corazón sobre un mesón de madera clara"
        width={1264}
        height={848}
        priority
        sizes="(max-width: 768px) 100vw, 48rem"
        className="mt-7 w-full rounded-tarjeta object-cover shadow-tarjeta"
      />

      <div className="mt-8 flex flex-col gap-5 text-[1.05rem] leading-relaxed text-tinta-media">
        <p>
          {NEGOCIO.nombre} nació en una cocina de {NEGOCIO.ciudad}, probando
          recetas con lo que había en la alacena: avena, arroz, un poco de
          cúrcuma, romero del antejardín. La primera tanda fue para la familia.
          La segunda ya la pidieron las vecinas.
        </p>
        <p className="text-[1.15rem] text-tinta">
          Hoy hacemos {recetas}, todas de glicerina vegetal, todas vertidas a
          mano, molde por molde.
        </p>
        <p>
          No producimos en serie y no queremos hacerlo. Cada tanda sale distinta:
          el romero queda en un lugar diferente, la cúrcuma se vetea a su manera,
          la cáscara de naranja se acomoda sola. Por eso ningún jabón es idéntico
          a otro, y por eso cada uno lleva su etiqueta pegada a mano.
        </p>

        <h2 className="mt-3 text-2xl text-tinta">Lo que sí prometemos</h2>
        <ul className="flex flex-col gap-2.5 pl-5">
          <li className="list-disc marker:text-rosa">
            Ingredientes que puedes reconocer y nombrar.
          </li>
          <li className="list-disc marker:text-rosa">
            Base de glicerina vegetal que limpia sin dejar la piel tirante.
          </li>
          <li className="list-disc marker:text-rosa">
            Tandas pequeñas y frescas, no inventario viejo de bodega.
          </li>
          <li className="list-disc marker:text-rosa">
            Contarte con honestidad para qué sirve cada jabón y para qué no.
          </li>
        </ul>

        <h2 className="mt-3 text-2xl text-tinta">Lo que no prometemos</h2>
        <p>
          Nuestros jabones son cosméticos artesanales, no medicamentos. Ayudan a
          limpiar, calmar, hidratar y cuidar la piel, pero no tratan ni curan
          enfermedades. Si tienes una condición en la piel, consúltalo con tu
          dermatóloga o dermatólogo: preferimos decirte esto a vendértelo como
          milagro.
        </p>
      </div>

      <div className="mt-10 rounded-tarjeta bg-rosa-niebla p-7 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl">
          {NEGOCIO.tagline}
        </p>
        <Link
          href="/catalogo"
          className="mt-4 inline-block rounded-full bg-rosa px-7 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
        >
          Conoce el catálogo
        </Link>
      </div>
    </div>
  )
}
