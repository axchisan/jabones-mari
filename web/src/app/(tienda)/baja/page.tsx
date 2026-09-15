import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, AlertCircle } from 'lucide-react'
import { revocarPorToken } from '@/lib/notificaciones/suscriptores'
import { NEGOCIO } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Darse de baja',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Baja de las novedades.
 *
 * Se procesa al abrir el enlace, sin pedir nada más: la ley exige que
 * retirar el consentimiento sea tan fácil como darlo. Los correos de
 * pedidos no se ven afectados, porque son transaccionales.
 */
export default async function Baja({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const correo = t ? await revocarPorToken(t) : null

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {correo ? (
        <>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-salvia-suave text-salvia">
            <Check className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl">Listo, te diste de baja</h1>
          <p className="mt-3 text-tinta-media">
            No volveremos a enviar novedades a <strong>{correo}</strong>.
          </p>
          <p className="mt-3 text-sm text-tinta-tenue">
            Si haces un pedido, seguirás recibiendo su confirmación: esos correos son parte
            de la compra, no publicidad.
          </p>
        </>
      ) : (
        <>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
            <AlertCircle className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl">Este enlace no es válido</h1>
          <p className="mt-3 text-tinta-media">
            Puede que ya te hayas dado de baja o que el enlace esté incompleto. Escríbenos y
            lo resolvemos.
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogo"
          className="rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
        >
          Ver el catálogo
        </Link>
        <Link
          href="/contacto"
          className="rounded-full border border-linea-fuerte px-6 py-3 font-semibold text-tinta-media transition hover:border-rosa hover:text-rosa-hondo"
        >
          Escribirnos
        </Link>
      </div>

      <p className="mt-10 text-xs text-tinta-tenue">
        {NEGOCIO.nombre} · {NEGOCIO.tagline}
      </p>
    </div>
  )
}
