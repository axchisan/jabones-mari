import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const CARPETA = path.join(process.cwd(), 'public', 'productos')
const EXTENSIONES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

/** Las fotos disponibles en el proyecto, para elegirlas desde el panel. */
export async function listarImagenesDisponibles(): Promise<string[]> {
  try {
    const archivos = await fs.readdir(CARPETA)
    return archivos
      .filter((archivo) => EXTENSIONES.has(path.extname(archivo).toLowerCase()))
      .sort()
      .map((archivo) => `/productos/${archivo}`)
  } catch {
    return []
  }
}
