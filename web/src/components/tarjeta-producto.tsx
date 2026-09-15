'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { usarCarrito } from '@/lib/carrito'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Producto } from '@/lib/tipos'

export function TarjetaProducto({
  producto,
  prioridad = false,
}: {
  producto: Producto
  prioridad?: boolean
}) {
  const agregar = usarCarrito((e) => e.agregar)
  const [principal] = producto.imagenes

  return (
    <article className="group flex flex-col overflow-hidden rounded-tarjeta border border-linea bg-white shadow-tarjeta transition hover:shadow-elevada">
      <Link
        href={`/producto/${producto.slug}`}
        className="relative block aspect-square overflow-hidden bg-crema"
      >
        <Image
          src={principal.url}
          alt={principal.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
          priority={prioridad}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold text-white"
          style={{ backgroundColor: producto.colorMarca }}
        >
          {producto.claim}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[1.35rem] leading-tight">
            <Link href={`/producto/${producto.slug}`} className="hover:text-rosa-hondo">
              {producto.nombre}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-tinta-media">
            {producto.beneficios.slice(0, 2).join(' · ')}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {producto.tipoDePiel.map((tipo) => (
            <li
              key={tipo}
              className="rounded-full bg-salvia-suave px-2.5 py-0.5 text-[0.7rem] text-salvia"
            >
              Piel {tipo.toLowerCase()}
            </li>
          ))}
        </ul>

        <div className="mt-auto grid gap-2 pt-1">
          {producto.variantes.map((variante) => (
            <button
              key={variante.id}
              type="button"
              disabled={!variante.disponible}
              title={
                variante.disponibles !== null && variante.disponibles <= 5
                  ? `Quedan ${variante.disponibles}`
                  : undefined
              }
              onClick={() => agregar(producto, variante)}
              className="flex items-center justify-between gap-2 rounded-full border border-linea-fuerte bg-crema px-4 py-2.5 text-sm transition enabled:hover:border-rosa enabled:hover:bg-rosa-niebla enabled:hover:text-rosa-hondo disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="size-3.5" aria-hidden="true" />
                {ETIQUETA_TAMANO[variante.tamano]}
              </span>
              <span className="cifra font-semibold">
                {variante.disponible ? precio(variante.precio) : 'Agotado'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
