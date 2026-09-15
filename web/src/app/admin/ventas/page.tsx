import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { GraficoVentas, MasVendidos } from '@/components/admin/grafico-ventas'
import { EtiquetaEstado } from '@/components/tarjeta-pedido'
import { resumenDeVentas, type Periodo } from '@/lib/admin/estadisticas'
import { precio } from '@/lib/formato'
import { ETIQUETA_ORIGEN, type EstadoPedido } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ventas' }

const PERIODOS: { valor: Periodo; texto: string }[] = [
  { valor: 7, texto: '7 días' },
  { valor: 30, texto: '30 días' },
  { valor: 90, texto: '3 meses' },
  { valor: 365, texto: 'Un año' },
]

export default async function Ventas({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>
}) {
  const { dias } = await searchParams
  const elegido = Number(dias)
  const periodo = (PERIODOS.some((p) => p.valor === elegido) ? elegido : 30) as Periodo

  const r = await resumenDeVentas(periodo)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.8rem,4vw,2.4rem)]">Ventas</h1>
          <p className="mt-1 text-tinta-media">
            Solo cuentan los pedidos entregados: un pedido abierto todavía no es plata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/api/admin/ventas.csv?dias=${periodo}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2.5 text-sm transition hover:border-rosa hover:text-rosa-hondo"
          >
            <Download className="size-4" aria-hidden="true" />
            Descargar
          </Link>
          <Link
            href="/admin/ventas/nueva"
            className="inline-flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 font-semibold text-white transition hover:bg-rosa-hondo"
          >
            <Plus className="size-4" aria-hidden="true" />
            Registrar venta
          </Link>
        </div>
      </header>

      <nav aria-label="Periodo" className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <Link
            key={p.valor}
            href={`/admin/ventas?dias=${p.valor}`}
            aria-current={periodo === p.valor ? 'page' : undefined}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              periodo === p.valor
                ? 'border-rosa bg-rosa text-white'
                : 'border-linea-fuerte bg-white text-tinta-media hover:border-rosa',
            )}
          >
            {p.texto}
          </Link>
        ))}
      </nav>

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador
          etiqueta="Ingresos"
          valor={precio(r.ingresos)}
          detalle={
            r.variacion === null
              ? 'Sin periodo anterior para comparar'
              : `${r.variacion >= 0 ? '+' : ''}${r.variacion}% frente al periodo anterior`
          }
          tendencia={r.variacion}
        />
        <Indicador
          etiqueta="Pedidos entregados"
          valor={String(r.entregados)}
          detalle={`${r.unidades} ${r.unidades === 1 ? 'jabón' : 'jabones'}`}
        />
        <Indicador
          etiqueta="Ticket promedio"
          valor={precio(r.ticketPromedio)}
          detalle="Por pedido entregado"
        />
        <Indicador
          etiqueta="Sin atender"
          valor={String(r.sinAtender)}
          detalle={r.sinAtender > 0 ? 'Pedidos abiertos ahora' : 'Todo al día'}
          alerta={r.sinAtender > 0}
        />
      </section>

      <GraficoVentas datos={r.porDia} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MasVendidos productos={r.masVendidos.slice(0, 8)} />

        <div className="flex flex-col gap-4">
          <section className="rounded-tarjeta border border-linea bg-white p-5">
            <h3 className="font-[family-name:var(--font-display)] text-xl">
              De dónde vienen
            </h3>
            <p className="mt-0.5 text-sm text-tinta-media">
              Cuánto entra por la tienda y cuánto se registra a mano.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              {(['web', 'manual'] as const).map((origen) => (
                <div key={origen} className="rounded-suave bg-crema px-4 py-3">
                  <dt className="versalita text-tinta-tenue">{ETIQUETA_ORIGEN[origen]}</dt>
                  <dd className="cifra mt-1 text-xl font-semibold">
                    {precio(r.porOrigen[origen].ingresos)}
                  </dd>
                  <dd className="text-sm text-tinta-media">
                    {r.porOrigen[origen].pedidos}{' '}
                    {r.porOrigen[origen].pedidos === 1 ? 'pedido' : 'pedidos'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-tarjeta border border-linea bg-white p-5">
            <h3 className="font-[family-name:var(--font-display)] text-xl">
              En qué estado están
            </h3>
            {r.porEstado.length === 0 ? (
              <p className="mt-3 text-sm text-tinta-media">
                No hay pedidos en este periodo.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {r.porEstado.map(({ estado, cantidad }) => (
                  <li key={estado} className="flex items-center justify-between gap-3">
                    <EtiquetaEstado estado={estado as EstadoPedido} />
                    <span className="cifra text-sm font-semibold">{cantidad}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Indicador({
  etiqueta,
  valor,
  detalle,
  tendencia,
  alerta = false,
}: {
  etiqueta: string
  valor: string
  detalle: string
  tendencia?: number | null
  alerta?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-tarjeta border bg-white px-5 py-4',
        alerta ? 'border-rosa' : 'border-linea',
      )}
    >
      <span className="versalita text-tinta-tenue">{etiqueta}</span>
      <span
        className={cn(
          'cifra mt-1 block text-2xl font-semibold',
          alerta && 'text-rosa-hondo',
        )}
      >
        {valor}
      </span>
      <span className="mt-0.5 flex items-center gap-1 text-sm text-tinta-media">
        {typeof tendencia === 'number' &&
          (tendencia >= 0 ? (
            <TrendingUp className="size-3.5 shrink-0 text-salvia" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3.5 shrink-0 text-rosa-hondo" aria-hidden="true" />
          ))}
        {detalle}
      </span>
    </div>
  )
}
