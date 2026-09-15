'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { usarCarrito } from '@/lib/carrito'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Producto, type Variante } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'
import { DOMICILIO } from '@/lib/config'

/** Se avisa de las existencias solo cuando quedan pocas; si no, es ruido. */
const AVISAR_DESDE = 5

export function SelectorCompra({ producto }: { producto: Producto }) {
  const agregar = usarCarrito((e) => e.agregar)
  const enCarrito = usarCarrito((e) => e.items)
  const disponibles = producto.variantes.filter((v) => v.disponible)
  const [elegida, setElegida] = useState<Variante | undefined>(disponibles[0])

  const yaEnCarrito = elegida
    ? (enCarrito.find((i) => i.varianteId === elegida.id)?.cantidad ?? 0)
    : 0
  const tope = elegida?.disponibles ?? null
  const completo = tope !== null && yaEnCarrito >= tope

  if (disponibles.length === 0) {
    return (
      <p className="rounded-suave border border-linea-fuerte bg-crema-hondo px-5 py-4 text-tinta-media">
        Este jabón está agotado por ahora. Escríbenos por WhatsApp y te avisamos
        apenas salga de la próxima tanda.
      </p>
    )
  }

  return (
    <div className="rounded-tarjeta border border-linea bg-white p-5 shadow-tarjeta">
      <fieldset>
        <legend className="versalita mb-2.5 text-tinta-tenue">Elige el tamaño</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {producto.variantes.map((variante) => {
            const seleccionada = elegida?.id === variante.id
            return (
              <label
                key={variante.id}
                className={cn(
                  'flex cursor-pointer flex-col gap-0.5 rounded-suave border-2 px-4 py-3 transition',
                  !variante.disponible && 'cursor-not-allowed opacity-45',
                  seleccionada
                    ? 'border-rosa bg-rosa-niebla'
                    : 'border-linea hover:border-linea-fuerte',
                )}
              >
                <input
                  type="radio"
                  name={`tamano-${producto.slug}`}
                  value={variante.id}
                  checked={seleccionada}
                  disabled={!variante.disponible}
                  onChange={() => setElegida(variante)}
                  className="sr-only"
                />
                <span className="font-semibold">{ETIQUETA_TAMANO[variante.tamano]}</span>
                <span className="cifra text-lg">
                  {variante.disponible ? precio(variante.precio) : 'Agotado'}
                </span>
                <span className="text-xs text-tinta-tenue">{variante.molde}</span>
                {variante.disponible &&
                  variante.disponibles !== null &&
                  variante.disponibles <= AVISAR_DESDE && (
                    <span className="text-xs font-semibold text-rosa-hondo">
                      {variante.disponibles === 1
                        ? 'Queda 1'
                        : `Quedan ${variante.disponibles}`}
                    </span>
                  )}
              </label>
            )
          })}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!elegida || completo}
        onClick={() => elegida && agregar(producto, elegida)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-3.5 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-50"
      >
        <ShoppingBag className="size-[1.05rem]" aria-hidden="true" />
        {completo ? 'Ya tienes todas las que hay' : 'Agregar al carrito'}
      </button>

      <p className="mt-2.5 text-center text-xs text-tinta-tenue">
        {completo
          ? 'Tienes en el carrito todo lo que nos queda de esta presentación.'
          : DOMICILIO.texto}
      </p>
    </div>
  )
}
