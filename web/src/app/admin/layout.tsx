import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { NavegacionAdmin } from '@/components/admin/navegacion'
import { BotonSalir } from '@/components/auth/boton-salir'
import { requerirAdmin } from '@/lib/auth/sesion'
import { NEGOCIO } from '@/lib/config'

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel de Mari' },
  robots: { index: false, follow: false },
}

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const sesion = await requerirAdmin()

  return (
    <div className="min-h-dvh bg-crema-hondo">
      <header className="sticky top-0 z-20 border-b border-linea bg-crema/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-mari.png" alt="" width={36} height={36} />
            <div className="leading-none">
              <span className="block font-[family-name:var(--font-display)] text-lg">
                Panel de {NEGOCIO.nombreCorto}
              </span>
              <span className="block text-[0.7rem] text-tinta-tenue">
                {sesion.user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm text-tinta-media transition hover:border-rosa hover:text-rosa-hondo"
            >
              Ver la tienda
            </Link>
            <BotonSalir compacto />
          </div>
        </div>

        <NavegacionAdmin />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
