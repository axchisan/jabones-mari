import Link from 'next/link'
import { precio, fechaLegible } from '@/lib/formato'
import { ETIQUETA_ESTADO, ETIQUETA_TAMANO, type Pedido, type EstadoPedido } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  abierto: 'bg-rosa-suave text-rosa-hondo',
  confirmado: 'bg-salvia-suave text-salvia',
  en_preparacion: 'bg-crema-hondo text-dorado',
  en_camino: 'bg-crema-hondo text-tinta-media',
  entregado: 'bg-whatsapp-suave text-whatsapp',
  cancelado: 'bg-arena text-tinta-tenue',
}

export function EtiquetaEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[0.7rem] font-semibold',
        COLOR_ESTADO[estado],
      )}
    >
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}

export function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0)

  return (
    <article className="rounded-tarjeta border border-linea bg-white p-5 shadow-tarjeta">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="cifra font-[family-name:var(--font-sans)] text-base font-bold">
            {pedido.codigo}
          </h3>
          <p className="text-xs text-tinta-tenue">{fechaLegible(pedido.creadoEn)}</p>
        </div>
        <EtiquetaEstado estado={pedido.estado} />
      </header>

      <ul className="mt-3.5 flex flex-col gap-1.5 border-t border-linea pt-3.5">
        {pedido.items.map((item) => (
          <li key={item.varianteId} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0">
              <Link
                href={`/producto/${item.productoSlug}`}
                className="hover:text-rosa-hondo hover:underline"
              >
                {item.nombre}
              </Link>
              <span className="text-tinta-tenue">
                {' '}
                · {ETIQUETA_TAMANO[item.tamano]} × {item.cantidad}
              </span>
            </span>
            <span className="cifra shrink-0">{precio(item.precio * item.cantidad)}</span>
          </li>
        ))}
      </ul>

      <footer className="mt-3.5 flex items-baseline justify-between border-t border-linea pt-3.5">
        <span className="text-sm text-tinta-media">
          {unidades} {unidades === 1 ? 'jabón' : 'jabones'}
        </span>
        <span className="cifra text-lg font-semibold">{precio(pedido.total)}</span>
      </footer>

      {pedido.notas && (
        <p className="mt-3 rounded-suave bg-crema px-3.5 py-2.5 text-sm text-tinta-media">
          <span className="versalita text-tinta-tenue">Tu nota</span>
          <br />
          {pedido.notas}
        </p>
      )}
    </article>
  )
}
