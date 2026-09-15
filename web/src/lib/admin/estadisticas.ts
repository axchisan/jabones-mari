import 'server-only'
import { listarPedidos } from '@/lib/pedidos'
import { diaEnBogota } from '@/lib/formato'
import type { OrigenPedido, Pedido } from '@/lib/tipos'

/**
 * Estadísticas de venta.
 *
 * Solo cuentan como venta los pedidos **entregados**: un pedido abierto es
 * una intención, no plata en el bolsillo. Contarlos todos infla las cifras y
 * lleva a decisiones equivocadas sobre qué producir.
 */

export type Periodo = 7 | 30 | 90 | 365

export type ResumenVentas = {
  periodo: Periodo
  ingresos: number
  entregados: number
  ticketPromedio: number
  unidades: number
  porOrigen: Record<OrigenPedido, { pedidos: number; ingresos: number }>
  porEstado: { estado: string; cantidad: number }[]
  masVendidos: { nombre: string; unidades: number; ingresos: number }[]
  porDia: { dia: string; ingresos: number; pedidos: number }[]
  sinAtender: number
  variacion: number | null
}

function esVenta(pedido: Pedido): boolean {
  return pedido.estado === 'entregado'
}

function ingresosDe(pedidos: Pedido[]): number {
  return pedidos.reduce((suma, p) => suma + p.total, 0)
}

export async function resumenDeVentas(periodo: Periodo = 30): Promise<ResumenVentas> {
  const todos = await listarPedidos()

  const ahora = Date.now()
  const unDia = 24 * 60 * 60 * 1000
  const desde = ahora - periodo * unDia
  const desdeAnterior = ahora - periodo * 2 * unDia

  const enPeriodo = todos.filter((p) => p.creadoEn.getTime() >= desde)
  const enAnterior = todos.filter(
    (p) => p.creadoEn.getTime() >= desdeAnterior && p.creadoEn.getTime() < desde,
  )

  const ventas = enPeriodo.filter(esVenta)
  const ventasAnteriores = enAnterior.filter(esVenta)

  const ingresos = ingresosDe(ventas)
  const ingresosAnteriores = ingresosDe(ventasAnteriores)

  // Sin periodo anterior no hay con qué comparar: mejor no mostrar nada que
  // mostrar un "+100%" que no significa nada.
  const variacion =
    ingresosAnteriores > 0
      ? Math.round(((ingresos - ingresosAnteriores) / ingresosAnteriores) * 100)
      : null

  const porOrigen: ResumenVentas['porOrigen'] = {
    web: { pedidos: 0, ingresos: 0 },
    manual: { pedidos: 0, ingresos: 0 },
  }

  for (const venta of ventas) {
    const origen = (venta.origen ?? 'web') as OrigenPedido
    const casilla = porOrigen[origen] ?? porOrigen.web
    casilla.pedidos += 1
    casilla.ingresos += venta.total
  }

  const conteoEstados = new Map<string, number>()
  for (const pedido of enPeriodo) {
    conteoEstados.set(pedido.estado, (conteoEstados.get(pedido.estado) ?? 0) + 1)
  }

  const acumulado = new Map<string, { unidades: number; ingresos: number }>()
  let unidades = 0

  for (const venta of ventas) {
    for (const item of venta.items) {
      const actual = acumulado.get(item.nombre) ?? { unidades: 0, ingresos: 0 }
      actual.unidades += item.cantidad
      actual.ingresos += item.precio * item.cantidad
      acumulado.set(item.nombre, actual)
      unidades += item.cantidad
    }
  }

  const masVendidos = [...acumulado.entries()]
    .map(([nombre, datos]) => ({ nombre, ...datos }))
    .sort((a, b) => b.unidades - a.unidades)

  // Serie diaria completa: los días sin ventas también cuentan, si no el
  // gráfico miente sobre la constancia.
  const porDiaMapa = new Map<string, { ingresos: number; pedidos: number }>()
  for (let i = periodo - 1; i >= 0; i -= 1) {
    porDiaMapa.set(diaEnBogota(new Date(ahora - i * unDia)), { ingresos: 0, pedidos: 0 })
  }
  for (const venta of ventas) {
    const dia = diaEnBogota(venta.creadoEn)
    const casilla = porDiaMapa.get(dia)
    if (casilla) {
      casilla.ingresos += venta.total
      casilla.pedidos += 1
    }
  }

  return {
    periodo,
    ingresos,
    entregados: ventas.length,
    ticketPromedio: ventas.length > 0 ? Math.round(ingresos / ventas.length) : 0,
    unidades,
    porOrigen,
    porEstado: [...conteoEstados.entries()].map(([estado, cantidad]) => ({ estado, cantidad })),
    masVendidos,
    porDia: [...porDiaMapa.entries()].map(([dia, datos]) => ({ dia, ...datos })),
    sinAtender: todos.filter((p) => p.estado === 'abierto').length,
    variacion,
  }
}

/** Todas las ventas del periodo, para exportarlas. */
export async function ventasParaExportar(periodo: Periodo = 30): Promise<Pedido[]> {
  const todos = await listarPedidos()
  const desde = Date.now() - periodo * 24 * 60 * 60 * 1000
  return todos.filter((p) => p.creadoEn.getTime() >= desde)
}
