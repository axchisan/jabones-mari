import { precio } from '@/lib/formato'

/**
 * Ingresos por día.
 *
 * Una sola serie, un solo color: con dos, el verde salvia y el rosa de la
 * marca quedan a ΔE 6 en visión deuteranope — indistinguibles para quien no
 * ve bien el rojo. Los canales de venta se muestran como cifras aparte.
 */

type Dia = { dia: string; ingresos: number; pedidos: number }

const ALTO = 160
const COLOR = '#b14372'

function etiquetaDia(iso: string): string {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

export function GraficoVentas({ datos }: { datos: Dia[] }) {
  const maximo = Math.max(...datos.map((d) => d.ingresos), 1)
  const hayVentas = datos.some((d) => d.ingresos > 0)

  if (!hayVentas) {
    return (
      <div className="rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-10 text-center">
        <p className="text-tinta-media">
          Todavía no hay ventas entregadas en este periodo.
        </p>
        <p className="mt-1 text-sm text-tinta-tenue">
          Las ventas aparecen aquí cuando marcas el pedido como entregado.
        </p>
      </div>
    )
  }

  const ancho = 100 / datos.length

  return (
    <figure className="rounded-tarjeta border border-linea bg-white p-5">
      <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-xl">Ingresos por día</h3>
        <span className="text-sm text-tinta-tenue">
          Máximo del periodo: <span className="cifra">{precio(maximo)}</span>
        </span>
      </figcaption>

      <div className="relative" style={{ height: ALTO }}>
        {/* Línea de base, recesiva */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-linea" aria-hidden="true" />

        <div className="flex h-full items-end gap-[2px]">
          {datos.map((d) => {
            const altura = d.ingresos > 0 ? Math.max((d.ingresos / maximo) * 100, 3) : 0
            return (
              <div
                key={d.dia}
                className="group relative flex-1"
                style={{ height: '100%', minWidth: `${Math.max(ancho, 0.5)}%` }}
              >
                <div className="flex h-full items-end">
                  <div
                    className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-75"
                    style={{
                      height: `${altura}%`,
                      backgroundColor: d.ingresos > 0 ? COLOR : 'transparent',
                    }}
                  >
                    <span className="sr-only">
                      {etiquetaDia(d.dia)}: {precio(d.ingresos)} en {d.pedidos} pedidos
                    </span>
                  </div>
                </div>

                {d.ingresos > 0 && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-suave bg-tinta px-2.5 py-1.5 text-xs text-crema shadow-elevada group-hover:block"
                  >
                    <span className="cifra font-semibold">{precio(d.ingresos)}</span>
                    <span className="block text-[0.7rem] opacity-80">
                      {etiquetaDia(d.dia)} · {d.pedidos}{' '}
                      {d.pedidos === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-tinta-tenue">
        <span>{etiquetaDia(datos[0]?.dia ?? '')}</span>
        <span>{etiquetaDia(datos.at(-1)?.dia ?? '')}</span>
      </div>
    </figure>
  )
}

/** Productos más vendidos, en barras horizontales. Una sola serie. */
export function MasVendidos({
  productos,
}: {
  productos: { nombre: string; unidades: number; ingresos: number }[]
}) {
  if (productos.length === 0) {
    return (
      <div className="rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-10 text-center text-tinta-media">
        Sin ventas entregadas todavía.
      </div>
    )
  }

  const maximo = Math.max(...productos.map((p) => p.unidades), 1)

  return (
    <figure className="rounded-tarjeta border border-linea bg-white p-5">
      <figcaption className="mb-4">
        <h3 className="font-[family-name:var(--font-display)] text-xl">Más vendidos</h3>
        <p className="mt-0.5 text-sm text-tinta-media">Por unidades entregadas.</p>
      </figcaption>

      <ol className="flex flex-col gap-3">
        {productos.map((p) => (
          <li key={p.nombre}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{p.nombre}</span>
              <span className="cifra shrink-0 text-tinta-media">
                {p.unidades} und · {precio(p.ingresos)}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-crema-hondo">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((p.unidades / maximo) * 100, 4)}%`,
                  backgroundColor: COLOR,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}
