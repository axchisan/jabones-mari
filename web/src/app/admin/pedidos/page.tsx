import Link from 'next/link'
import { EtiquetaEstado } from '@/components/tarjeta-pedido'
import { listarPedidos } from '@/lib/pedidos'
import { precio, fechaLegible, telefonoLegible } from '@/lib/formato'
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, type EstadoPedido } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pedidos' }

export default async function PedidosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const todos = await listarPedidos()

  const filtro = ESTADOS_PEDIDO.includes(estado as EstadoPedido)
    ? (estado as EstadoPedido)
    : null

  const pedidos = filtro ? todos.filter((p) => p.estado === filtro) : todos

  const conteos = new Map<EstadoPedido, number>()
  for (const pedido of todos) {
    conteos.set(pedido.estado, (conteos.get(pedido.estado) ?? 0) + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)]">Pedidos</h1>
        <p className="mt-1 text-tinta-media">
          Los pedidos entran abiertos y se quedan así hasta que los confirmes por WhatsApp.
        </p>
      </header>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={cn(
            'rounded-full border px-4 py-2 text-sm transition',
            !filtro
              ? 'border-rosa bg-rosa text-white'
              : 'border-linea-fuerte bg-white text-tinta-media hover:border-rosa',
          )}
        >
          Todos ({todos.length})
        </Link>
        {ESTADOS_PEDIDO.map((valor) => {
          const cantidad = conteos.get(valor) ?? 0
          if (cantidad === 0 && filtro !== valor) return null
          return (
            <Link
              key={valor}
              href={`/admin/pedidos?estado=${valor}`}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition',
                filtro === valor
                  ? 'border-rosa bg-rosa text-white'
                  : 'border-linea-fuerte bg-white text-tinta-media hover:border-rosa',
              )}
            >
              {ETIQUETA_ESTADO[valor]} ({cantidad})
            </Link>
          )
        })}
      </nav>

      {pedidos.length === 0 ? (
        <p className="rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-12 text-center text-tinta-media">
          {filtro
            ? 'No hay pedidos en ese estado.'
            : 'Todavía no ha entrado ningún pedido por la página.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((pedido) => {
            const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0)
            return (
              <li key={pedido.id}>
                <Link
                  href={`/admin/pedidos/${pedido.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-tarjeta border border-linea bg-white p-4 transition hover:border-rosa"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cifra font-semibold">{pedido.codigo}</span>
                      <EtiquetaEstado estado={pedido.estado} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-tinta-media">
                      {pedido.clienteNombre} · {telefonoLegible(pedido.telefono)}
                    </p>
                    <p className="truncate text-xs text-tinta-tenue">
                      {unidades} {unidades === 1 ? 'jabón' : 'jabones'} ·{' '}
                      {fechaLegible(pedido.creadoEn)}
                      {pedido.usuarioId && ' · con cuenta'}
                    </p>
                  </div>
                  <span className="cifra text-lg font-semibold">{precio(pedido.total)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
