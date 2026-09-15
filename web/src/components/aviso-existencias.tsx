'use client'

import { Info, X } from 'lucide-react'

/**
 * Explica por qué desapareció algo del carrito.
 *
 * Se queda hasta que la clienta lo cierra. Es lo único que le dice que el
 * jabón que había elegido se agotó mientras compraba: si se borrara solo,
 * vería el carrito cambiar sin motivo aparente.
 */
export function AvisoExistencias({
  avisos,
  alCerrar,
  className,
}: {
  avisos: string[]
  alCerrar: () => void
  className?: string
}) {
  if (avisos.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-suave border border-rosa/40 bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo ${className ?? ''}`}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />

      <div className="flex-1">
        <p className="font-semibold">Cambió lo que teníamos disponible</p>
        <ul className="mt-1 flex flex-col gap-1">
          {avisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
        <p className="mt-1.5 text-xs opacity-80">
          Hacemos los jabones en tandas pequeñas, por eso a veces se acaban de un día
          para otro.
        </p>
      </div>

      <button
        type="button"
        onClick={alCerrar}
        className="grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-rosa/20"
        aria-label="Entendido, cerrar aviso"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
