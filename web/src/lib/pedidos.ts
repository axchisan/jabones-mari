import 'server-only'
import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'
import type { EstadoPedido, ItemPedido, Pedido } from '@/lib/tipos'

/** Repositorio de pedidos. La base de datos es la única fuente de verdad. */

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL: no hay dónde guardar los pedidos')
  return db
}

type NuevoPedido = {
  clienteNombre: string
  telefono: string
  correo?: string | null
  aceptaPromociones?: boolean
  direccion?: string | null
  barrio?: string | null
  notas?: string | null
  items: ItemPedido[]
  usuarioId?: string | null
}

export type CambiosPedido = Partial<
  Pick<
    Pedido,
    | 'clienteNombre'
    | 'telefono'
    | 'correo'
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

export async function crearPedido(entrada: NuevoPedido): Promise<Pedido> {
  const conexion = baseDeDatos()
  const subtotal = calcularSubtotal(entrada.items)
  const ahora = new Date()

  const [{ conteo }] = await conexion
    .select({ conteo: sql<number>`count(*)::int` })
    .from(esquema.pedidos)

  const pedido: Pedido = {
    id: randomUUID(),
    codigo: codigoDesde(conteo + 1),
    usuarioId: entrada.usuarioId ?? null,
    clienteNombre: entrada.clienteNombre,
    telefono: entrada.telefono,
    correo: entrada.correo ?? null,
    aceptaPromociones: entrada.aceptaPromociones ?? false,
    direccion: entrada.direccion ?? null,
    barrio: entrada.barrio ?? null,
    notas: entrada.notas ?? null,
    observacionesInternas: null,
    items: entrada.items,
    subtotal,
    domicilio: 0,
    total: subtotal,
    // Nace abierto: la confirmación real ocurre en la conversación de WhatsApp.
    estado: 'abierto' as EstadoPedido,
    creadoEn: ahora,
    actualizadoEn: ahora,
  }

  await conexion.insert(esquema.pedidos).values(pedido)
  return pedido
}

export async function listarPedidos(): Promise<Pedido[]> {
  const filas = await baseDeDatos()
    .select()
    .from(esquema.pedidos)
    .orderBy(desc(esquema.pedidos.creadoEn))
  return filas as Pedido[]
}

/** Los pedidos de una clienta con cuenta, para su historial. */
export async function listarPedidosDeUsuario(usuarioId: string): Promise<Pedido[]> {
  const filas = await baseDeDatos()
    .select()
    .from(esquema.pedidos)
    .where(eq(esquema.pedidos.usuarioId, usuarioId))
    .orderBy(desc(esquema.pedidos.creadoEn))
  return filas as Pedido[]
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  const [fila] = await baseDeDatos()
    .select()
    .from(esquema.pedidos)
    .where(eq(esquema.pedidos.id, id))
    .limit(1)
  return (fila as Pedido) ?? null
}

export async function obtenerPedidoPorCodigo(codigo: string): Promise<Pedido | null> {
  const [fila] = await baseDeDatos()
    .select()
    .from(esquema.pedidos)
    .where(eq(esquema.pedidos.codigo, codigo))
    .limit(1)
  return (fila as Pedido) ?? null
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

  await baseDeDatos()
    .update(esquema.pedidos)
    .set({
      clienteNombre: actualizado.clienteNombre,
      telefono: actualizado.telefono,
      correo: actualizado.correo,
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

export async function eliminarPedido(id: string): Promise<void> {
  await baseDeDatos().delete(esquema.pedidos).where(eq(esquema.pedidos.id, id))
}

/** Resumen para el tablero del panel. */
export async function resumenPedidos() {
  const conexion = baseDeDatos()
  const filas = await conexion
    .select({ estado: esquema.pedidos.estado, total: esquema.pedidos.total })
    .from(esquema.pedidos)

  const porEstado = new Map<string, number>()
  let ventasConfirmadas = 0

  for (const fila of filas) {
    porEstado.set(fila.estado, (porEstado.get(fila.estado) ?? 0) + 1)
    if (fila.estado === 'entregado') ventasConfirmadas += fila.total
  }

  return {
    total: filas.length,
    abiertos: porEstado.get('abierto') ?? 0,
    porEstado,
    ventasConfirmadas,
  }
}
