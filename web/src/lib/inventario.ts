import 'server-only'
import { and, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'
import type { ItemPedido } from '@/lib/tipos'

/**
 * Inventario y disponibilidad.
 *
 * El stock va por presentación y es opcional: `null` significa que esa
 * presentación no lleva cuenta (se hace por encargo, no se agota). Un número
 * significa unidades reales.
 *
 * Lo importante: **lo disponible no es lo que dice el stock**, sino el stock
 * menos lo ya comprometido en pedidos que todavía no se entregan. Sin eso,
 * dos clientas pueden pedir la última unidad con cinco minutos de diferencia
 * y las dos reciben confirmación.
 *
 * El stock se descuenta al entregar, no al pedir: hasta que el jabón no sale,
 * no se ha vendido. Lo que evita la sobreventa mientras tanto es el cálculo de
 * comprometido.
 */

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL')
  return db
}

/** Estados en los que un pedido ya apartó producto pero aún no salió. */
const COMPROMETEN = ['abierto', 'confirmado', 'en_preparacion', 'en_camino'] as const

/**
 * Cuántas unidades tiene apartadas cada presentación en pedidos vivos.
 *
 * Los pedidos guardan sus líneas como JSON, así que se suman en memoria. Con
 * el volumen de este negocio sobra; si algún día son miles, esto se convierte
 * en una tabla de líneas con su índice.
 *
 * `exceptoPedido` deja fuera un pedido concreto, para cuando se está editando:
 * sus propias líneas ya están contadas y restarían dos veces.
 */
export async function comprometidoPorVariante(
  exceptoPedido?: string,
): Promise<Map<string, number>> {
  const conexion = baseDeDatos()

  const filas = await conexion
    .select({ id: esquema.pedidos.id, items: esquema.pedidos.items })
    .from(esquema.pedidos)
    .where(
      exceptoPedido
        ? and(
            inArray(esquema.pedidos.estado, COMPROMETEN),
            ne(esquema.pedidos.id, exceptoPedido),
          )
        : inArray(esquema.pedidos.estado, COMPROMETEN),
    )

  const comprometido = new Map<string, number>()

  for (const fila of filas) {
    for (const item of fila.items ?? []) {
      comprometido.set(
        item.varianteId,
        (comprometido.get(item.varianteId) ?? 0) + item.cantidad,
      )
    }
  }

  return comprometido
}

export type Disponibilidad = {
  varianteId: string
  stock: number | null
  comprometido: number
  /** Unidades que se pueden vender ahora. `null` = sin límite. */
  disponibles: number | null
  /** La presentación está oculta o el producto inactivo. */
  oculta: boolean
}

type Opciones = {
  /** No contar las líneas de este pedido (se está editando). */
  exceptoPedido?: string
  /** Dejar vender presentaciones ocultas. El panel sí puede. */
  permitirOcultas?: boolean
}

/** Cuántas unidades quedan realmente de cada presentación pedida. */
export async function disponibilidadDe(
  varianteIds: string[],
  opciones: Opciones = {},
): Promise<Map<string, Disponibilidad>> {
  const resultado = new Map<string, Disponibilidad>()
  if (varianteIds.length === 0) return resultado

  const conexion = baseDeDatos()
  const unicos = [...new Set(varianteIds)]

  const [filas, comprometido] = await Promise.all([
    conexion
      .select({
        id: esquema.variantes.id,
        stock: esquema.variantes.stock,
        visible: esquema.variantes.disponible,
        activo: esquema.productos.activo,
      })
      .from(esquema.variantes)
      .innerJoin(esquema.productos, eq(esquema.variantes.productoId, esquema.productos.id))
      .where(inArray(esquema.variantes.id, unicos)),
    comprometidoPorVariante(opciones.exceptoPedido),
  ])

  for (const fila of filas) {
    const apartado = comprometido.get(fila.id) ?? 0
    const oculta = !fila.visible || !fila.activo
    const sinLimite = fila.stock === null

    resultado.set(fila.id, {
      varianteId: fila.id,
      stock: fila.stock,
      comprometido: apartado,
      disponibles:
        oculta && !opciones.permitirOcultas
          ? 0
          : sinLimite
            ? null
            : Math.max((fila.stock ?? 0) - apartado, 0),
      oculta,
    })
  }

  return resultado
}

export type Falta = {
  varianteId: string
  nombre: string
  pedido: number
  disponibles: number
}

/**
 * Comprueba que se pueda despachar lo que se pide.
 * Devuelve las líneas que no alcanzan; vacío significa que todo cuadra.
 */
export async function revisarDisponibilidad(
  items: Pick<ItemPedido, 'varianteId' | 'nombre' | 'cantidad'>[],
  opciones: Opciones = {},
): Promise<Falta[]> {
  if (items.length === 0) return []

  const mapa = await disponibilidadDe(
    items.map((i) => i.varianteId),
    opciones,
  )
  const faltas: Falta[] = []

  for (const item of items) {
    const info = mapa.get(item.varianteId)

    // Una presentación que ya no existe no se puede vender.
    if (!info) {
      faltas.push({
        varianteId: item.varianteId,
        nombre: item.nombre,
        pedido: item.cantidad,
        disponibles: 0,
      })
      continue
    }

    if (info.disponibles === null) continue

    if (item.cantidad > info.disponibles) {
      faltas.push({
        varianteId: item.varianteId,
        nombre: item.nombre,
        pedido: item.cantidad,
        disponibles: info.disponibles,
      })
    }
  }

  return faltas
}

/** Explica en una frase qué fue lo que no alcanzó. */
export function mensajeDeFaltas(faltas: Falta[]): string {
  const detalle = faltas
    .map((f) =>
      f.disponibles === 0
        ? `${f.nombre} se agotó`
        : `de ${f.nombre} solo ${f.disponibles === 1 ? 'queda 1' : `quedan ${f.disponibles}`}`,
    )
    .join('; ')

  return `Se nos acabaron las existencias mientras armabas el pedido: ${detalle}. Ajusta las cantidades y vuelve a intentar.`
}

/** Descuenta del inventario lo que salió en un pedido entregado. */
export async function descontarPorEntrega(items: ItemPedido[]): Promise<void> {
  const conexion = baseDeDatos()

  for (const item of items) {
    await conexion
      .update(esquema.variantes)
      .set({
        // greatest(…, 0) evita dejar el inventario en negativo si alguien
        // ajustó el stock a mano entre el pedido y la entrega.
        stock: sql`greatest(coalesce(${esquema.variantes.stock}, 0) - ${item.cantidad}, 0)`,
      })
      // Sin stock declarado no hay nada que descontar: es por encargo.
      .where(and(eq(esquema.variantes.id, item.varianteId), isNotNull(esquema.variantes.stock)))
  }
}

/** Devuelve al inventario lo de un pedido entregado que se deshizo. */
export async function devolverAlInventario(items: ItemPedido[]): Promise<void> {
  const conexion = baseDeDatos()

  for (const item of items) {
    await conexion
      .update(esquema.variantes)
      .set({ stock: sql`coalesce(${esquema.variantes.stock}, 0) + ${item.cantidad}` })
      // Sin stock declarado no hay nada que descontar: es por encargo.
      .where(and(eq(esquema.variantes.id, item.varianteId), isNotNull(esquema.variantes.stock)))
  }
}
