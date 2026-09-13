import type { Metadata } from 'next'
import Link from 'next/link'
import { X } from 'lucide-react'
import { TarjetaProducto } from '@/components/tarjeta-producto'
import { obtenerProductos, facetas } from '@/lib/catalogo'
import { cn } from '@/lib/utilidades'

export const metadata: Metadata = {
  title: 'Catálogo de jabones artesanales',
  description:
    'Conoce nuestras seis recetas naturales en tamaño grande y pequeño. Filtra por tipo de piel y por uso. Domicilios en Bogotá.',
  alternates: { canonical: '/catalogo' },
}

type Filtros = { piel?: string; uso?: string }

export default async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<Filtros>
}) {
  const { piel, uso } = await searchParams
  const todos = await obtenerProductos()
  const opciones = facetas(todos)

  const productos = todos.filter((p) => {
    if (piel && !p.tipoDePiel.includes(piel)) return false
    if (uso && !p.uso.includes(uso)) return false
    return true
  })

  const hayFiltros = Boolean(piel || uso)

  const enlaceCon = (cambio: Filtros) => {
    const params = new URLSearchParams()
    const siguiente = { piel, uso, ...cambio }
    if (siguiente.piel) params.set('piel', siguiente.piel)
    if (siguiente.uso) params.set('uso', siguiente.uso)
    const consulta = params.toString()
    return consulta ? `/catalogo?${consulta}` : '/catalogo'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-2">
        <span className="versalita text-rosa-hondo">Catálogo</span>
        <h1 className="text-[clamp(2.2rem,6vw,3.2rem)] leading-tight">
          Seis recetas, dos tamaños
        </h1>
        <p className="max-w-xl text-tinta-media">
          Todos nuestros jabones vienen en presentación grande y pequeña. Elige
          por tipo de piel o por lo que quieras que haga por ti.
        </p>
      </header>

      <search className="mt-7 flex flex-col gap-3">
        <GrupoFiltro
          etiqueta="Tipo de piel"
          opciones={opciones.tipoDePiel}
          activo={piel}
          enlaceCon={(valor) => enlaceCon({ piel: valor })}
        />
        <GrupoFiltro
          etiqueta="Uso"
          opciones={opciones.uso}
          activo={uso}
          enlaceCon={(valor) => enlaceCon({ uso: valor })}
        />
        {hayFiltros && (
          <Link
            href="/catalogo"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-tinta-media underline-offset-4 hover:text-rosa-hondo hover:underline"
          >
            <X className="size-3.5" aria-hidden="true" />
            Quitar filtros
          </Link>
        )}
      </search>

      <p className="mt-6 text-sm text-tinta-tenue" aria-live="polite">
        {productos.length} {productos.length === 1 ? 'jabón' : 'jabones'}
        {hayFiltros ? ' con estos filtros' : ' en el catálogo'}
      </p>

      {productos.length === 0 ? (
        <div className="mt-8 rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-10 text-center">
          <p className="text-tinta-media">
            No tenemos jabones con esa combinación todavía.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block rounded-full bg-rosa px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rosa-hondo"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto, i) => (
            <TarjetaProducto key={producto.id} producto={producto} prioridad={i < 3} />
          ))}
        </div>
      )}
    </div>
  )
}

function GrupoFiltro({
  etiqueta,
  opciones,
  activo,
  enlaceCon,
}: {
  etiqueta: string
  opciones: string[]
  activo?: string
  enlaceCon: (valor: string | undefined) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="versalita w-24 shrink-0 text-tinta-tenue">{etiqueta}</span>
      <ul className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const seleccionada = activo === opcion
          return (
            <li key={opcion}>
              <Link
                href={enlaceCon(seleccionada ? undefined : opcion)}
                aria-pressed={seleccionada}
                className={cn(
                  'block rounded-full border px-3.5 py-1.5 text-sm transition',
                  seleccionada
                    ? 'border-rosa bg-rosa text-white'
                    : 'border-linea-fuerte bg-white text-tinta-media hover:border-rosa hover:text-rosa-hondo',
                )}
              >
                {opcion}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
