'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import { subirFoto } from '@/lib/admin/acciones-imagenes'

/**
 * Subida de fotos desde el panel. Pensada para el celular: el input abre
 * directamente la galería o la cámara.
 */
export function SubidorFoto({
  nombreBase,
  habilitado,
  alSubir,
}: {
  nombreBase: string
  habilitado: boolean
  alSubir: (url: string) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!habilitado) {
    return (
      <p className="rounded-suave border border-dashed border-linea-fuerte bg-crema px-4 py-3 text-xs text-tinta-tenue">
        Para subir fotos desde aquí falta configurar el almacenamiento. Mientras tanto,
        elige entre las que ya están en el proyecto.
      </p>
    )
  }

  async function manejarArchivos(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return

    setError(null)
    setSubiendo(true)

    for (const archivo of Array.from(archivos)) {
      const datos = new FormData()
      datos.set('archivo', archivo)
      datos.set('nombreBase', nombreBase || archivo.name.replace(/\.[^.]+$/, ''))

      const resultado = await subirFoto(datos)

      if (resultado.ok) {
        alSubir(resultado.url)
      } else {
        setError(resultado.error)
        break
      }
    }

    setSubiendo(false)
    if (entrada.current) entrada.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={entrada}
        id="subir-foto"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(evento) => manejarArchivos(evento.target.files)}
      />

      <button
        type="button"
        disabled={subiendo}
        onClick={() => entrada.current?.click()}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-linea-fuerte bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-rosa hover:text-rosa-hondo disabled:opacity-60"
      >
        {subiendo ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
        {subiendo ? 'Subiendo…' : 'Subir fotos'}
      </button>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-suave bg-rosa-suave px-3.5 py-2.5 text-sm text-rosa-hondo"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <p className="text-xs text-tinta-tenue">
        JPG, PNG o WebP, hasta 8 MB. Puedes elegir varias a la vez.
      </p>
    </div>
  )
}
