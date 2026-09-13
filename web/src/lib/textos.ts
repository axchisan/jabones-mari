import type { Producto } from '@/lib/tipos'
import { precio } from '@/lib/formato'

const LETRAS = [
  'cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis',
  'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
]

/** 6 → "seis". Por encima de veinte se devuelve la cifra. */
export function enLetras(numero: number): string {
  return LETRAS[numero] ?? String(numero)
}

/** ["avena","arroz","miel"] → "avena, arroz y miel" */
export function listaNatural(elementos: string[]): string {
  if (elementos.length === 0) return ''
  if (elementos.length === 1) return elementos[0]
  return `${elementos.slice(0, -1).join(', ')} y ${elementos.at(-1)}`
}

/** "6 jabones" / "1 jabón" */
export function contarJabones(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'jabón' : 'jabones'}`
}

/** "seis recetas" / "una receta" */
export function contarRecetas(cantidad: number): string {
  return `${enLetras(cantidad)} ${cantidad === 1 ? 'receta' : 'recetas'}`
}

/** Los nombres de las recetas, en orden, para textos corridos. */
export function nombresDeRecetas(productos: Producto[]): string {
  return listaNatural(productos.map((p) => p.nombre.toLowerCase()))
}

/**
 * Los ingredientes que dan nombre a las recetas, sin repetir.
 * "Menta y Romero" + "Arroz" → "menta, romero y arroz"
 */
export function ingredientesDestacados(productos: Producto[], maximo = 6): string {
  const vistos = new Set<string>()
  for (const producto of productos) {
    for (const parte of producto.nombre.split(/\s+y\s+|,\s*/i)) {
      const limpio = parte
        .toLowerCase()
        .replace(/^aceite de\s+/, '')
        .trim()
      if (limpio && !vistos.has(limpio)) vistos.add(limpio)
      if (vistos.size >= maximo) break
    }
    if (vistos.size >= maximo) break
  }
  return listaNatural([...vistos])
}

/** "desde $5.000" — null si no hay productos con precio. */
export function textoDesde(productos: Producto[]): string | null {
  const precios = productos.flatMap((p) =>
    p.variantes.filter((v) => v.disponible).map((v) => v.precio),
  )
  if (precios.length === 0) return null
  return `desde ${precio(Math.min(...precios))}`
}

/** "grande y pequeño" a partir de los tamaños que existen de verdad. */
export function textoTamanos(productos: Producto[]): string {
  const etiquetas = new Set<string>()
  for (const producto of productos) {
    for (const variante of producto.variantes) {
      etiquetas.add(variante.tamano === 'grande' ? 'grande' : 'pequeño')
    }
  }
  return listaNatural([...etiquetas])
}

/** "dos tamaños" / "un tamaño" — para titulares. */
export function contarTamanos(productos: Producto[]): string {
  const etiquetas = new Set(productos.flatMap((p) => p.variantes.map((v) => v.tamano)))
  const cantidad = etiquetas.size
  if (cantidad === 0) return ''
  return cantidad === 1 ? 'un tamaño' : `${enLetras(cantidad)} tamaños`
}
