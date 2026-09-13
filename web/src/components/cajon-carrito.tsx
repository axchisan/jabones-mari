'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react'
import { usarCarrito, subtotalDe, unidadesDe } from '@/lib/carrito'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO } from '@/lib/tipos'
import { DOMICILIO } from '@/lib/config'

export function CajonCarrito() {
  const ruta = usePathname()
  const dialogo = useRef<HTMLDialogElement>(null)
  const abierto = usarCarrito((e) => e.abierto)
  const cerrar = usarCarrito((e) => e.cerrar)
  const items = usarCarrito((e) => e.items)
  const cambiarCantidad = usarCarrito((e) => e.cambiarCantidad)
  const quitar = usarCarrito((e) => e.quitar)

  const subtotal = subtotalDe(items)
  const unidades = unidadesDe(items)

  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (abierto && !el.open) el.showModal()
    if (!abierto && el.open) el.close()
  }, [abierto])

  useEffect(() => {
    cerrar()
  }, [ruta, cerrar])

  return (
    <dialog
      ref={dialogo}
      className="cajon"
      onClose={cerrar}
      onClick={(evento) => {
        // Clic sobre el ::backdrop: el target es el propio dialog
        if (evento.target === dialogo.current) cerrar()
      }}
      aria-label="Tu carrito"
    >
      <div className="flex h-full w-[min(26rem,100vw)] flex-col bg-crema">
        <header className="flex items-center justify-between border-b border-linea px-5 py-4">
          <h2 className="text-xl">
            Tu carrito{' '}
            {unidades > 0 && (
              <span className="cifra text-sm text-tinta-tenue">
                ({unidades} {unidades === 1 ? 'producto' : 'productos'})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            className="grid size-9 place-items-center rounded-full text-tinta-media transition hover:bg-crema-hondo hover:text-tinta"
            aria-label="Cerrar carrito"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <p className="text-tinta-media">
              Todavía no has agregado ningún jabón.
            </p>
            <Link
              href="/catalogo"
              onClick={cerrar}
              className="rounded-full bg-rosa px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rosa-hondo"
            >
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-linea overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.varianteId} className="flex gap-3.5 py-4">
                  <Link href={`/producto/${item.productoSlug}`} onClick={cerrar} className="shrink-0">
                    <Image
                      src={item.imagen}
                      alt=""
                      width={72}
                      height={72}
                      className="size-18 rounded-suave bg-white object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/producto/${item.productoSlug}`}
                          onClick={cerrar}
                          className="block truncate font-[family-name:var(--font-display)] text-[1.05rem] leading-snug hover:text-rosa-hondo"
                        >
                          {item.nombre}
                        </Link>
                        <span className="versalita text-tinta-tenue">
                          {ETIQUETA_TAMANO[item.tamano]}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitar(item.varianteId)}
                        className="grid size-7 shrink-0 place-items-center rounded-full text-tinta-tenue transition hover:bg-rosa-suave hover:text-rosa-hondo"
                        aria-label={`Quitar ${item.nombre} ${ETIQUETA_TAMANO[item.tamano]} del carrito`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-full border border-linea-fuerte bg-white">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}
                          className="grid size-8 place-items-center rounded-l-full text-tinta-media transition hover:text-rosa-hondo"
                          aria-label="Quitar una unidad"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="cifra w-7 text-center text-sm font-semibold" aria-live="polite">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}
                          className="grid size-8 place-items-center rounded-r-full text-tinta-media transition hover:text-rosa-hondo"
                          aria-label="Agregar una unidad"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="cifra font-semibold">
                        {precio(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-linea bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-tinta-media">Subtotal</span>
                <span className="cifra text-xl font-semibold">{precio(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-tinta-tenue">{DOMICILIO.texto}</p>
              <Link
                href="/pedido"
                onClick={cerrar}
                className="mt-3.5 block rounded-full bg-rosa px-6 py-3.5 text-center font-semibold text-white shadow-tarjeta transition hover:bg-rosa-hondo"
              >
                Continuar con el pedido
              </Link>
              <Link
                href="/catalogo"
                onClick={cerrar}
                className="mt-2 block py-2 text-center text-sm text-tinta-media transition hover:text-rosa-hondo"
              >
                Seguir viendo jabones
              </Link>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
