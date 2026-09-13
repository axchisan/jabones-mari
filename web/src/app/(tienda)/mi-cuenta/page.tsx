import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, ShieldCheck } from 'lucide-react'
import { TarjetaPedido } from '@/components/tarjeta-pedido'
import { BotonSalir } from '@/components/auth/boton-salir'
import { FormularioDatosEntrega } from '@/components/auth/formulario-datos-entrega'
import { requerirSesion, esAdmin } from '@/lib/auth/sesion'
import { listarPedidosDeUsuario } from '@/lib/pedidos'

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description: 'Tus pedidos y tus datos de entrega.',
  robots: { index: false, follow: false },
}

export default async function MiCuenta({
  searchParams,
}: {
  searchParams: Promise<{ sinPermiso?: string }>
}) {
  const { sinPermiso } = await searchParams
  const sesion = await requerirSesion()
  const usuario = sesion.user
  const pedidos = await listarPedidosDeUsuario(usuario.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="versalita text-rosa-hondo">Mi cuenta</span>
          <h1 className="mt-1 text-[clamp(2rem,5vw,2.8rem)] leading-tight">
            Hola, {usuario.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-tinta-media">{usuario.email}</p>
        </div>
        <BotonSalir />
      </header>

      {sinPermiso && (
        <p
          role="alert"
          className="mt-6 rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo"
        >
          Esa sección es solo para el equipo de Mari.
        </p>
      )}

      {esAdmin(usuario) && (
        <Link
          href="/admin"
          className="mt-6 flex items-center gap-3 rounded-tarjeta border border-linea bg-white px-5 py-4 shadow-tarjeta transition hover:border-rosa"
        >
          <ShieldCheck className="size-5 shrink-0 text-rosa" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Panel de administración</span>
            <span className="block text-sm text-tinta-media">
              Catálogo, pedidos y equipo
            </span>
          </span>
        </Link>
      )}

      <section className="mt-9">
        <h2 className="text-2xl">Tus pedidos</h2>

        {pedidos.length === 0 ? (
          <div className="mt-4 rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
              <ShoppingBag className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-tinta-media">Todavía no has hecho ningún pedido.</p>
            <Link
              href="/catalogo"
              className="mt-5 inline-block rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
            >
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {pedidos.map((pedido) => (
              <TarjetaPedido key={pedido.id} pedido={pedido} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Tus datos de entrega</h2>
        <p className="mt-1 text-tinta-media">
          Los guardamos para que no tengas que escribirlos en cada pedido.
        </p>
        <FormularioDatosEntrega
          inicial={{
            telefono: usuario.telefono ?? '',
            direccion: usuario.direccion ?? '',
            barrio: usuario.barrio ?? '',
          }}
        />
      </section>
    </div>
  )
}
