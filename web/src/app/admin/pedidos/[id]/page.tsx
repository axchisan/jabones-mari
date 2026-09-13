import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { EditorPedido } from '@/components/admin/editor-pedido'
import { EtiquetaEstado } from '@/components/tarjeta-pedido'
import { obtenerPedido } from '@/lib/pedidos'
import { opcionesParaAgregar } from '@/lib/admin/acciones-pedidos'
import { fechaLegible } from '@/lib/formato'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pedido = await obtenerPedido(id)
  return { title: pedido ? pedido.codigo : 'Pedido' }
}

export default async function DetallePedido({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [pedido, opciones] = await Promise.all([obtenerPedido(id), opcionesParaAgregar()])

  if (!pedido) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 text-sm text-tinta-media transition hover:text-rosa-hondo"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Pedidos
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="cifra text-[clamp(1.8rem,4vw,2.4rem)]">{pedido.codigo}</h1>
          <EtiquetaEstado estado={pedido.estado} />
        </div>

        <p className="mt-1 text-sm text-tinta-tenue">
          Entró el {fechaLegible(pedido.creadoEn)}
          {pedido.actualizadoEn > pedido.creadoEn && (
            <> · última edición {fechaLegible(pedido.actualizadoEn)}</>
          )}
          {pedido.usuarioId ? ' · pedido con cuenta' : ' · pedido sin cuenta'}
        </p>
      </div>

      <EditorPedido pedido={pedido} opciones={opciones} />
    </div>
  )
}
