'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Eye, EyeOff, Star, Pencil, Loader2 } from 'lucide-react'
import {
  alternarActivo,
  alternarDestacado,
  moverProducto,
} from '@/lib/admin/acciones-productos'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Producto } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

export function FilaProducto({
  producto,
  esPrimero,
  esUltimo,
}: {
  producto: Producto
  esPrimero: boolean
  esUltimo: boolean
}) {
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()

  const portada = producto.imagenes[0]
  const agotado =
    producto.variantes.length > 0 && producto.variantes.every((v) => !v.disponible)

  function ejecutar(accion: () => Promise<unknown>) {
    iniciar(async () => {
      await accion()
      router.refresh()
    })
  }

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-tarjeta border bg-white p-4 transition',
        producto.activo ? 'border-linea' : 'border-dashed border-linea-fuerte opacity-70',
        pendiente && 'pointer-events-none opacity-60',
      )}
    >
      {/* Orden */}
      <div className="flex flex-col">
        <button
          type="button"
          disabled={esPrimero || pendiente}
          onClick={() => ejecutar(() => moverProducto(producto.id, 'arriba'))}
          className="grid size-7 place-items-center rounded-t-md border border-linea text-tinta-media transition enabled:hover:bg-rosa-niebla enabled:hover:text-rosa-hondo disabled:opacity-30"
          aria-label={`Subir ${producto.nombre}`}
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={esUltimo || pendiente}
          onClick={() => ejecutar(() => moverProducto(producto.id, 'abajo'))}
          className="grid size-7 place-items-center rounded-b-md border border-t-0 border-linea text-tinta-media transition enabled:hover:bg-rosa-niebla enabled:hover:text-rosa-hondo disabled:opacity-30"
          aria-label={`Bajar ${producto.nombre}`}
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Portada */}
      {portada ? (
        <Image
          src={portada.url}
          alt=""
          width={60}
          height={60}
          className="size-15 shrink-0 rounded-suave bg-crema object-cover"
        />
      ) : (
        <span className="grid size-15 shrink-0 place-items-center rounded-suave bg-crema text-[0.6rem] text-tinta-tenue">
          sin foto
        </span>
      )}

      {/* Datos */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg leading-tight">
            {producto.nombre}
          </h2>
          {!producto.activo && (
            <span className="rounded-full bg-arena px-2 py-0.5 text-[0.65rem] text-tinta-tenue">
              Oculto
            </span>
          )}
          {agotado && (
            <span className="rounded-full bg-rosa-suave px-2 py-0.5 text-[0.65rem] text-rosa-hondo">
              Agotado
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-sm text-tinta-media">
          {producto.variantes.length === 0 ? (
            <span className="text-rosa-hondo">Sin presentaciones</span>
          ) : (
            producto.variantes
              .map(
                (v) =>
                  `${ETIQUETA_TAMANO[v.tamano]} ${precio(v.precio)}${
                    v.stock !== null ? ` · ${v.stock} und` : ''
                  }${v.disponible ? '' : ' (agotado)'}`,
              )
              .join('  ·  ')
          )}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1.5">
        {pendiente && (
          <Loader2 className="size-4 animate-spin text-tinta-tenue" aria-hidden="true" />
        )}

        <button
          type="button"
          disabled={pendiente}
          onClick={() => ejecutar(() => alternarDestacado(producto.id, !producto.destacado))}
          className={cn(
            'grid size-9 place-items-center rounded-full border transition',
            producto.destacado
              ? 'border-dorado bg-crema-hondo text-dorado'
              : 'border-linea text-tinta-tenue hover:border-dorado hover:text-dorado',
          )}
          aria-pressed={producto.destacado}
          aria-label={
            producto.destacado
              ? `Quitar ${producto.nombre} de la portada`
              : `Destacar ${producto.nombre} en la portada`
          }
          title={producto.destacado ? 'Destacado en la portada' : 'Destacar en la portada'}
        >
          <Star
            className="size-4"
            fill={producto.destacado ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          disabled={pendiente}
          onClick={() => ejecutar(() => alternarActivo(producto.id, !producto.activo))}
          className={cn(
            'grid size-9 place-items-center rounded-full border transition',
            producto.activo
              ? 'border-linea text-salvia hover:border-salvia'
              : 'border-linea-fuerte text-tinta-tenue hover:border-rosa hover:text-rosa-hondo',
          )}
          aria-pressed={producto.activo}
          aria-label={
            producto.activo ? `Ocultar ${producto.nombre}` : `Publicar ${producto.nombre}`
          }
          title={producto.activo ? 'Visible en la tienda' : 'Oculto'}
        >
          {producto.activo ? (
            <Eye className="size-4" aria-hidden="true" />
          ) : (
            <EyeOff className="size-4" aria-hidden="true" />
          )}
        </button>

        <Link
          href={`/admin/productos/${producto.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosa-hondo"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar
        </Link>
      </div>
    </li>
  )
}
