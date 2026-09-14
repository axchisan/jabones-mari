import Link from 'next/link'
import { ClipboardList, Package, AlertTriangle, ArrowRight } from 'lucide-react'
import { EtiquetaEstado } from '@/components/tarjeta-pedido'
import { AvisosDePedidos } from '@/components/admin/avisos-pedidos'
import { obtenerTodosLosProductos } from '@/lib/catalogo'
import { listarPedidos } from '@/lib/pedidos'
import { precio, fechaLegible } from '@/lib/formato'

export const dynamic = 'force-dynamic'

export default async function TableroAdmin() {
  const [productos, pedidos] = await Promise.all([
    obtenerTodosLosProductos(),
    listarPedidos(),
  ])

  const abiertos = pedidos.filter((p) => p.estado === 'abierto')
  const entregados = pedidos.filter((p) => p.estado === 'entregado')
  const ocultos = productos.filter((p) => !p.activo)
  const sinPresentaciones = productos.filter((p) => p.variantes.length === 0)
  const agotados = productos.filter(
    (p) => p.variantes.length > 0 && p.variantes.every((v) => !v.disponible),
  )

  const ventas = entregados.reduce((suma, p) => suma + p.total, 0)
  const ultimos = pedidos.slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)]">Resumen</h1>
        <p className="mt-1 text-tinta-media">
          Lo que necesita atención hoy.
        </p>
      </header>

      <AvisosDePedidos />

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador
          etiqueta="Pedidos sin atender"
          valor={String(abiertos.length)}
          detalle={abiertos.length > 0 ? 'Esperando confirmación' : 'Todo al día'}
          alerta={abiertos.length > 0}
          href="/admin/pedidos?estado=abierto"
        />
        <Indicador
          etiqueta="Pedidos en total"
          valor={String(pedidos.length)}
          detalle={`${entregados.length} entregados`}
          href="/admin/pedidos"
        />
        <Indicador
          etiqueta="Vendido y entregado"
          valor={precio(ventas)}
          detalle="Suma de pedidos entregados"
        />
        <Indicador
          etiqueta="Productos publicados"
          valor={String(productos.length - ocultos.length)}
          detalle={ocultos.length > 0 ? `${ocultos.length} ocultos` : 'Todos visibles'}
          href="/admin/productos"
        />
      </section>

      {(sinPresentaciones.length > 0 || agotados.length > 0) && (
        <section className="rounded-tarjeta border border-linea-fuerte bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg">
            <AlertTriangle className="size-4 text-dorado" aria-hidden="true" />
            Revisa esto
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {sinPresentaciones.map((producto) => (
              <li key={producto.id} className="flex items-center justify-between gap-3">
                <span>
                  <strong>{producto.nombre}</strong> no tiene presentaciones, así que no se
                  puede comprar.
                </span>
                <Link
                  href={`/admin/productos/${producto.id}`}
                  className="shrink-0 font-semibold text-rosa-hondo hover:underline"
                >
                  Arreglar
                </Link>
              </li>
            ))}
            {agotados.map((producto) => (
              <li key={producto.id} className="flex items-center justify-between gap-3">
                <span>
                  <strong>{producto.nombre}</strong> está agotado en todas sus presentaciones.
                </span>
                <Link
                  href={`/admin/productos/${producto.id}`}
                  className="shrink-0 font-semibold text-rosa-hondo hover:underline"
                >
                  Revisar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl">Últimos pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rosa-hondo hover:underline"
          >
            Ver todos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <p className="mt-4 rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-8 text-center text-tinta-media">
            Todavía no ha entrado ningún pedido por la página.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-linea overflow-hidden rounded-tarjeta border border-linea bg-white">
            {ultimos.map((pedido) => (
              <li key={pedido.id}>
                <Link
                  href={`/admin/pedidos/${pedido.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-rosa-niebla"
                >
                  <span className="min-w-0">
                    <span className="cifra block font-semibold">{pedido.codigo}</span>
                    <span className="block truncate text-sm text-tinta-media">
                      {pedido.clienteNombre} · {fechaLegible(pedido.creadoEn)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <EtiquetaEstado estado={pedido.estado} />
                    <span className="cifra font-semibold">{precio(pedido.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-3 rounded-tarjeta border border-linea bg-white px-5 py-4 transition hover:border-rosa"
        >
          <Package className="size-5 shrink-0 text-rosa" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Agregar un producto</span>
            <span className="block text-sm text-tinta-media">Una receta nueva al catálogo</span>
          </span>
        </Link>
        <Link
          href="/admin/pedidos"
          className="flex items-center gap-3 rounded-tarjeta border border-linea bg-white px-5 py-4 transition hover:border-rosa"
        >
          <ClipboardList className="size-5 shrink-0 text-rosa" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Atender pedidos</span>
            <span className="block text-sm text-tinta-media">
              {abiertos.length > 0
                ? `${abiertos.length} sin confirmar`
                : 'No hay pendientes'}
            </span>
          </span>
        </Link>
      </section>
    </div>
  )
}

function Indicador({
  etiqueta,
  valor,
  detalle,
  alerta = false,
  href,
}: {
  etiqueta: string
  valor: string
  detalle: string
  alerta?: boolean
  href?: string
}) {
  const contenido = (
    <>
      <span className="versalita text-tinta-tenue">{etiqueta}</span>
      <span
        className={`cifra mt-1 block text-3xl font-semibold ${alerta ? 'text-rosa-hondo' : ''}`}
      >
        {valor}
      </span>
      <span className="mt-0.5 block text-sm text-tinta-media">{detalle}</span>
    </>
  )

  const clases = `rounded-tarjeta border bg-white px-5 py-4 ${
    alerta ? 'border-rosa' : 'border-linea'
  }`

  return href ? (
    <Link href={href} className={`${clases} block transition hover:border-rosa`}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  )
}
