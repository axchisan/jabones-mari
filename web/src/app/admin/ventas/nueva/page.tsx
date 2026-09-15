import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioVentaManual } from '@/components/admin/formulario-venta-manual'
import { presentacionesParaVender } from '@/lib/admin/acciones-venta-manual'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Registrar venta' }

export default async function NuevaVenta() {
  const presentaciones = await presentacionesParaVender()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/ventas"
          className="inline-flex items-center gap-1.5 text-sm text-tinta-media transition hover:text-rosa-hondo"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Ventas
        </Link>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)]">Registrar una venta</h1>
        <p className="mt-1 max-w-2xl text-tinta-media">
          Para las ventas que no pasaron por la tienda: por WhatsApp, en persona o en una
          feria. Quedan en el mismo historial, así las cuentas del negocio cuadran.
        </p>
      </div>

      <FormularioVentaManual presentaciones={presentaciones} />
    </div>
  )
}
