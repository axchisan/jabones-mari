import Link from 'next/link'
import { Plus } from 'lucide-react'
import { FilaProducto } from '@/components/admin/fila-producto'
import { obtenerTodosLosProductos } from '@/lib/catalogo'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Catálogo' }

export default async function ProductosAdmin() {
  const productos = await obtenerTodosLosProductos()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.8rem,4vw,2.4rem)]">Catálogo</h1>
          <p className="mt-1 text-tinta-media">
            {productos.length === 0
              ? 'Todavía no hay productos.'
              : `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}. El orden es el que verá la clienta.`}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 font-semibold text-white transition hover:bg-rosa-hondo"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar producto
        </Link>
      </header>

      {productos.length === 0 ? (
        <div className="rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-12 text-center">
          <p className="text-tinta-media">
            El catálogo está vacío. Agrega el primer jabón para que aparezca en la tienda.
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="mt-5 inline-block rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
          >
            Agregar el primero
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {productos.map((producto, indice) => (
            <FilaProducto
              key={producto.id}
              producto={producto}
              esPrimero={indice === 0}
              esUltimo={indice === productos.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
