import { PRODUCTOS_SEMILLA } from '@/content/productos'
import type { Producto, Variante } from '@/lib/tipos'

/**
 * Acceso al catálogo. Hoy lee de la semilla en código; cuando exista
 * DATABASE_URL leerá de Postgres sin que cambie nada aguas arriba.
 */

export async function obtenerProductos(): Promise<Producto[]> {
  return PRODUCTOS_SEMILLA.filter((p) => p.activo).sort((a, b) => a.orden - b.orden)
}

export async function obtenerProducto(slug: string): Promise<Producto | null> {
  return PRODUCTOS_SEMILLA.find((p) => p.slug === slug && p.activo) ?? null
}

export async function obtenerDestacados(): Promise<Producto[]> {
  const productos = await obtenerProductos()
  return productos.filter((p) => p.destacado)
}

export async function obtenerVariante(varianteId: string): Promise<Variante | null> {
  for (const producto of PRODUCTOS_SEMILLA) {
    const variante = producto.variantes.find((v) => v.id === varianteId)
    if (variante) return variante
  }
  return null
}

/** Precio más bajo disponible de un producto, para el "desde $X" de las tarjetas. */
export function precioDesde(producto: Producto): number {
  const disponibles = producto.variantes.filter((v) => v.disponible)
  const lista = disponibles.length > 0 ? disponibles : producto.variantes
  return Math.min(...lista.map((v) => v.precio))
}

export function hayDisponibilidad(producto: Producto): boolean {
  return producto.variantes.some((v) => v.disponible)
}

/** Facetas para los filtros del catálogo, derivadas del propio catálogo. */
export function facetas(productos: Producto[]) {
  const piel = new Set<string>()
  const uso = new Set<string>()
  for (const p of productos) {
    p.tipoDePiel.forEach((t) => piel.add(t))
    p.uso.forEach((u) => uso.add(u))
  }
  return {
    tipoDePiel: [...piel].sort(),
    uso: [...uso].sort(),
  }
}
