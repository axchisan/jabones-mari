'use server'

import { requerirAdmin } from '@/lib/auth/sesion'
import { subirImagen, hayAlmacenamiento } from '@/lib/almacenamiento/r2'

export type ResultadoImagen =
  | { ok: true; url: string }
  | { ok: false; error: string }

/** Sube una foto desde el panel y devuelve su dirección pública. */
export async function subirFoto(datos: FormData): Promise<ResultadoImagen> {
  await requerirAdmin()

  if (!hayAlmacenamiento) {
    return {
      ok: false,
      error: 'Falta configurar el almacenamiento de fotos. Ver docs/08-despliegue.md',
    }
  }

  const archivo = datos.get('archivo')
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: 'No llegó ninguna imagen' }
  }

  const nombreBase = String(datos.get('nombreBase') ?? 'foto')
  const resultado = await subirImagen(archivo, nombreBase)

  return resultado.ok
    ? { ok: true, url: resultado.url }
    : { ok: false, error: resultado.error }
}
