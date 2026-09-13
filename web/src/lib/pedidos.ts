import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { db, hayBaseDeDatos, esquema } from '@/lib/db/cliente'
import type { EstadoPedido, ItemPedido, Pedido } from '@/lib/tipos'

/**
 * Repositorio de pedidos.
 *
 * Con DATABASE_URL escribe en Postgres. Sin ella, guarda en un archivo local
 * para poder desarrollar y probar el flujo completo antes de conectar la base.
 */

const ARCHIVO_LOCAL = path.join(process.cwd(), '.pedidos-dev.json')

type NuevoPedido = {
  clienteNombre: string
  telefono: string
  direccion?: string | null
  barrio?: string | null
  notas?: string | null
  items: ItemPedido[]
}

export type CambiosPedido = Partial<
  Pick<
    Pedido,
    | 'clienteNombre'
    | 'telefono'
    | 'direccion'
    | 'barrio'
    | 'notas'
    | 'observacionesInternas'
    | 'estado'
    | 'domicilio'
    | 'items'
  >
>

function calcularSubtotal(items: ItemPedido[]): number {
  return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
}

function codigoDesde(consecutivo: number): string {
  return `MARI-${String(consecutivo).padStart(4, '0')}`
}

/* ---------------------------------------------------------------- archivo */

async function leerLocal(): Promise<Pedido[]> {
  try {
    const crudo = await fs.readFile(ARCHIVO_LOCAL, 'utf8')
    const datos = JSON.parse(crudo) as Pedido[]
    return datos.map((p) => ({
      ...p,
      creadoEn: new Date(p.creadoEn),
      actualizadoEn: new Date(p.actualizadoEn),
    }))
  } catch {
    return []
  }
}

async function escribirLocal(pedidos: Pedido[]): Promise<void> {
  await fs.writeFile(ARCHIVO_LOCAL, JSON.stringify(pedidos, null, 2), 'utf8')
}

/* ------------------------------------------------------------------- API */

export async function crearPedido(entrada: NuevoPedido): Promise<Pedido> {
  const subtotal = calcularSubtotal(entrada.items)
  const ahora = new Date()

  const base = {
    id: randomUUID(),
    clienteNombre: entrada.clienteNombre,
    telefono: entrada.telefono,
    direccion: entrada.direccion ?? null,
    barrio: entrada.barrio ?? null,
    notas: entrada.notas ?? null,
    observacionesInternas: null,
    items: entrada.items,
    subtotal,
    domicilio: 0,
    total: subtotal,
    estado: 'abierto' as EstadoPedido,
    creadoEn: ahora,
    actualizadoEn: ahora,
  }

  if (hayBaseDeDatos && db) {
    const [{ conteo }] = await db
      .select({ conteo: sql<number>`count(*)::int` })
      .from(esquema.pedidos)
    const pedido = { ...base, codigo: codigoDesde(conteo + 1) }
    await db.insert(esquema.pedidos).values(pedido)
    return pedido
  }

  const pedidos = await leerLocal()
  const pedido = { ...base, codigo: codigoDesde(pedidos.length + 1) }
  await escribirLocal([pedido, ...pedidos])
  return pedido
}

export async function listarPedidos(): Promise<Pedido[]> {
  if (hayBaseDeDatos && db) {
    const filas = await db
      .select()
      .from(esquema.pedidos)
      .orderBy(desc(esquema.pedidos.creadoEn))
    return filas as Pedido[]
  }
  const pedidos = await leerLocal()
  return pedidos.sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  if (hayBaseDeDatos && db) {
    const [fila] = await db
      .select()
      .from(esquema.pedidos)
      .where(eq(esquema.pedidos.id, id))
      .limit(1)
    return (fila as Pedido) ?? null
  }
  const pedidos = await leerLocal()
  return pedidos.find((p) => p.id === id) ?? null
}

export async function actualizarPedido(
  id: string,
  cambios: CambiosPedido,
): Promise<Pedido | null> {
  const actual = await obtenerPedido(id)
  if (!actual) return null

  const items = cambios.items ?? actual.items
  const subtotal = calcularSubtotal(items)
  const domicilio = cambios.domicilio ?? actual.domicilio

  const actualizado: Pedido = {
    ...actual,
    ...cambios,
    items,
    subtotal,
    domicilio,
    total: subtotal + domicilio,
    actualizadoEn: new Date(),
  }

  if (hayBaseDeDatos && db) {
    await db
      .update(esquema.pedidos)
      .set({
        clienteNombre: actualizado.clienteNombre,
        telefono: actualizado.telefono,
        direccion: actualizado.direccion,
        barrio: actualizado.barrio,
        notas: actualizado.notas,
        observacionesInternas: actualizado.observacionesInternas,
        items: actualizado.items,
        subtotal: actualizado.subtotal,
        domicilio: actualizado.domicilio,
        total: actualizado.total,
        estado: actualizado.estado,
        actualizadoEn: actualizado.actualizadoEn,
      })
      .where(eq(esquema.pedidos.id, id))
    return actualizado
  }

  const pedidos = await leerLocal()
  await escribirLocal(pedidos.map((p) => (p.id === id ? actualizado : p)))
  return actualizado
}

export async function eliminarPedido(id: string): Promise<void> {
  if (hayBaseDeDatos && db) {
    await db.delete(esquema.pedidos).where(eq(esquema.pedidos.id, id))
    return
  }
  const pedidos = await leerLocal()
  await escribirLocal(pedidos.filter((p) => p.id !== id))
}
