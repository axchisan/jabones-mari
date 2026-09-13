import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioProducto } from '@/components/admin/formulario-producto'
import { listarImagenesDisponibles } from '@/lib/admin/imagenes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nuevo producto' }

export default async function NuevoProducto() {
  const imagenes = await listarImagenesDisponibles()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1.5 text-sm text-tinta-media transition hover:text-rosa-hondo"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Catálogo
        </Link>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)]">Nuevo producto</h1>
        <p className="mt-1 text-tinta-media">
          Al crearlo podrás agregarle las presentaciones y sus precios.
        </p>
      </div>

      <FormularioProducto imagenesDisponibles={imagenes} />
    </div>
  )
}
