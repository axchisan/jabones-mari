import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { FormularioProducto } from '@/components/admin/formulario-producto'
import { Presentaciones } from '@/components/admin/variantes'
import { obtenerProductoPorId } from '@/lib/catalogo'
import { listarImagenesDisponibles } from '@/lib/admin/imagenes'
import { hayAlmacenamiento } from '@/lib/almacenamiento/r2'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const producto = await obtenerProductoPorId(id)
  return { title: producto ? producto.nombre : 'Producto' }
}

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [producto, imagenes] = await Promise.all([
    obtenerProductoPorId(id),
    listarImagenesDisponibles(),
  ])

  if (!producto) notFound()

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
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)]">{producto.nombre}</h1>
        <p className="cifra mt-1 text-sm text-tinta-tenue">/producto/{producto.slug}</p>
      </div>

      <Presentaciones productoId={producto.id} variantes={producto.variantes} />

      <FormularioProducto
        producto={producto}
        imagenesDisponibles={imagenes}
        puedeSubir={hayAlmacenamiento}
      />
    </div>
  )
}
