'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { usarCarrito } from '@/lib/carrito'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Producto, type Variante } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'
import { DOMICILIO } from '@/lib/config'

export function SelectorCompra({ producto }: { producto: Producto }) {
  const agregar = usarCarrito((e) => e.agregar)
  const disponibles = producto.variantes.filter((v) => v.disponible)
  const [elegida, setElegida] = useState<Variante | undefined>(disponibles[0])

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
              </label>
            )
          })}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!elegida}
        onClick={() => elegida && agregar(producto, elegida)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-3.5 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-50"
      >
        <ShoppingBag className="size-[1.05rem]" aria-hidden="true" />
        Agregar al carrito
      </button>

      <p className="mt-2.5 text-center text-xs text-tinta-tenue">{DOMICILIO.texto}</p>
    </div>
  )
}
