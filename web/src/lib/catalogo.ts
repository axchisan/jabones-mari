import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { db, hayBaseDeDatos, esquema } from '@/lib/db/cliente'
import { PRODUCTOS_SEMILLA } from '@/content/productos'
import type { Producto, Tamano, Variante, Imagen } from '@/lib/tipos'

/**
 * Acceso al catálogo.
 *
 * La fuente de verdad es la base de datos: todo lo que se ve en la tienda
 * sale de ahí y se administra desde el panel. Si no hay DATABASE_URL
 * configurada se cae a la semilla en código, para poder levantar el
 * proyecto recién clonado sin base.
 */

type FilaProducto = typeof esquema.productos.$inferSelect
type FilaVariante = typeof esquema.variantes.$inferSelect

/**
 * Durante la compilación la base puede no estar disponible: en CI no hay
 * credenciales y en producción Neon puede estar despertando. Un despliegue
 * no debe caerse por eso, así que en esa fase se devuelve el catálogo vacío
 * y las páginas se generan después, bajo demanda.
 *
 * En ejecución normal el error sí se propaga: es preferible una página de
 * error a una tienda que parece vacía sin motivo.
 */
const enCompilacion = process.env.NEXT_PHASE === 'phase-production-build'

async function tolerarEnCompilacion<T>(consulta: () => Promise<T>, vacio: T): Promise<T> {
  if (!enCompilacion) return consulta()

  try {
    return await consulta()
  } catch (error) {
    console.warn(
      '[catalogo] la base no respondió durante la compilación; se sigue sin datos.',
      error instanceof Error ? error.message : error,
    )
    return vacio
  }
}

function aVariante(fila: FilaVariante): Variante {
  return {
    id: fila.id,
    productoId: fila.productoId,
    tamano: fila.tamano as Tamano,
    precio: fila.precio,
    pesoGramos: fila.pesoGramos,
    molde: fila.molde ?? '',
    sku: fila.sku,
    stock: fila.stock,
    disponible: fila.disponible && (fila.stock === null || fila.stock > 0),
    orden: fila.orden,
  }
}

function aProducto(fila: FilaProducto, variantes: FilaVariante[]): Producto {
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    claim: fila.claim ?? '',
    descripcion: fila.descripcion ?? '',
    modoDeUso: fila.modoDeUso ?? '',
    advertencia: fila.advertencia,
    ingredientes: fila.ingredientes ?? [],
    beneficios: fila.beneficios ?? [],
    tipoDePiel: fila.tipoDePiel ?? [],
    uso: fila.uso ?? [],
    aroma: fila.aroma ?? '',
    colorMarca: fila.colorMarca ?? '#b14372',
    imagenes: (fila.imagenes ?? []) as Imagen[],
    destacado: fila.destacado,
    activo: fila.activo,
    orden: fila.orden,
    creadoEn: fila.creadoEn,
    variantes: variantes
      .filter((v) => v.productoId === fila.id)
      .sort((a, b) => a.orden - b.orden)
      .map(aVariante),
  }
}

/** Todo el catálogo, incluidos los ocultos. Solo para el panel. */
export async function obtenerTodosLosProductos(): Promise<Producto[]> {
  if (!hayBaseDeDatos || !db) {
    return [...PRODUCTOS_SEMILLA].sort((a, b) => a.orden - b.orden)
  }

  return tolerarEnCompilacion(async () => {
    const [filas, filasVariantes] = await Promise.all([
      db!.select().from(esquema.productos).orderBy(asc(esquema.productos.orden)),
      db!.select().from(esquema.variantes),
    ])

    return filas.map((fila) => aProducto(fila, filasVariantes))
  }, [])
}

/** Lo que ve la clienta: solo productos activos. */
export async function obtenerProductos(): Promise<Producto[]> {
  const todos = await obtenerTodosLosProductos()
  return todos.filter((p) => p.activo)
}

export async function obtenerProducto(slug: string): Promise<Producto | null> {
  if (!hayBaseDeDatos || !db) {
    return PRODUCTOS_SEMILLA.find((p) => p.slug === slug && p.activo) ?? null
  }

  return tolerarEnCompilacion(async () => {
    const [fila] = await db!
      .select()
      .from(esquema.productos)
      .where(eq(esquema.productos.slug, slug))
      .limit(1)

    if (!fila || !fila.activo) return null

    const filasVariantes = await db!
      .select()
      .from(esquema.variantes)
      .where(eq(esquema.variantes.productoId, fila.id))

    return aProducto(fila, filasVariantes)
  }, null)
}

/** Igual que la anterior pero sin filtrar por activo: el panel edita ocultos. */
export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  if (!hayBaseDeDatos || !db) {
    return PRODUCTOS_SEMILLA.find((p) => p.id === id) ?? null
  }

  const [fila] = await db
    .select()
    .from(esquema.productos)
    .where(eq(esquema.productos.id, id))
    .limit(1)

  if (!fila) return null

  const filasVariantes = await db
    .select()
    .from(esquema.variantes)
    .where(eq(esquema.variantes.productoId, fila.id))

  return aProducto(fila, filasVariantes)
}

export async function obtenerDestacados(limite?: number): Promise<Producto[]> {
  const productos = await obtenerProductos()
  const destacados = productos.filter((p) => p.destacado)
  const lista = destacados.length > 0 ? destacados : productos
  return typeof limite === 'number' ? lista.slice(0, limite) : lista
}

export async function obtenerVariante(varianteId: string): Promise<Variante | null> {
  if (!hayBaseDeDatos || !db) {
    for (const producto of PRODUCTOS_SEMILLA) {
      const variante = producto.variantes.find((v) => v.id === varianteId)
      if (variante) return variante
    }
    return null
  }

  const [fila] = await db
    .select()
    .from(esquema.variantes)
    .where(eq(esquema.variantes.id, varianteId))
    .limit(1)

  return fila ? aVariante(fila) : null
}

/** Precio más bajo disponible, para el "desde $X". */
export function precioDesde(producto: Producto): number {
  const disponibles = producto.variantes.filter((v) => v.disponible)
  const lista = disponibles.length > 0 ? disponibles : producto.variantes
  if (lista.length === 0) return 0
  return Math.min(...lista.map((v) => v.precio))
}

export function hayDisponibilidad(producto: Producto): boolean {
  return producto.variantes.some((v) => v.disponible)
}

/** Facetas de los filtros, derivadas del catálogo real. */
export function facetas(productos: Producto[]) {
  const piel = new Set<string>()
  const uso = new Set<string>()
  const tamanos = new Set<string>()

  for (const p of productos) {
    p.tipoDePiel.forEach((t) => piel.add(t))
    p.uso.forEach((u) => uso.add(u))
    p.variantes.forEach((v) => tamanos.add(v.tamano))
  }

  return {
    tipoDePiel: [...piel].sort(),
    uso: [...uso].sort(),
    tamanos: [...tamanos],
  }
}

/** Rango de precios del catálogo, para textos del tipo "desde $5.000". */
export function rangoDePrecios(productos: Producto[]): { min: number; max: number } | null {
  const precios = productos.flatMap((p) => p.variantes.map((v) => v.precio))
  if (precios.length === 0) return null
  return { min: Math.min(...precios), max: Math.max(...precios) }
}
