import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ShieldCheck, Mail } from 'lucide-react'
import { TarjetaPedido } from '@/components/tarjeta-pedido'
import { BotonSalir } from '@/components/auth/boton-salir'
import {
  FormularioPerfil,
  FormularioContrasena,
} from '@/components/auth/formulario-perfil'
import { requerirSesion, esAdmin } from '@/lib/auth/sesion'
import { formasDeEntrar } from '@/lib/auth/cuentas'
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

  const [pedidos, entradas] = await Promise.all([
    listarPedidosDeUsuario(usuario.id),
    formasDeEntrar(usuario.id),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {usuario.image && (
            <Image
              src={usuario.image}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full border border-linea"
              unoptimized
            />
          )}
          <div>
            <span className="versalita text-rosa-hondo">Mi cuenta</span>
            <h1 className="mt-1 text-[clamp(2rem,5vw,2.8rem)] leading-tight">
              Hola, {usuario.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-tinta-media">{usuario.email}</p>
          </div>
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
              Catálogo, pedidos, ventas y equipo
            </span>
          </span>
        </Link>
      )}

      {/* ---------- Pedidos ---------- */}
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

      {/* ---------- Perfil ---------- */}
      <section className="mt-12">
        <h2 className="text-2xl">Tus datos</h2>
        <p className="mt-1 text-tinta-media">
          Los usamos para llenar tus pedidos sin que tengas que escribirlos cada vez.
        </p>
        <FormularioPerfil
          inicial={{
            name: usuario.name ?? '',
            telefono: usuario.telefono ?? '',
            direccion: usuario.direccion ?? '',
            barrio: usuario.barrio ?? '',
          }}
        />
      </section>

      {/* ---------- Cómo entras ---------- */}
      <section className="mt-12">
        <h2 className="text-2xl">Cómo entras</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {entradas.conContrasena && (
            <li className="inline-flex items-center gap-2 rounded-full border border-linea bg-white px-4 py-2 text-sm">
              <Mail className="size-4 text-tinta-tenue" aria-hidden="true" />
              Correo y contraseña
            </li>
          )}
          {entradas.conGoogle && (
            <li className="inline-flex items-center gap-2 rounded-full border border-linea bg-white px-4 py-2 text-sm">
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23"
                />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.87z" />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.07L5.84 9.9c.87-2.6 3.3-4.53 6.16-4.53"
                />
              </svg>
              Google
            </li>
          )}
        </ul>

        {entradas.conGoogle && entradas.conContrasena && (
          <p className="mt-3 text-sm text-tinta-media">
            Tienes las dos formas activas sobre la misma cuenta: puedes entrar como prefieras y
            siempre verás los mismos pedidos.
          </p>
        )}

        <FormularioContrasena tieneContrasena={entradas.conContrasena} />
      </section>
    </div>
  )
}
