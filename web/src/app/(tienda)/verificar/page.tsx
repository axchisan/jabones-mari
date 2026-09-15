import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CajaAuth } from '@/components/auth/campos'
import { FormularioCodigo } from '@/components/auth/formulario-codigo'

export const metadata: Metadata = {
  title: 'Confirma tu correo',
  robots: { index: false, follow: false },
}

export default async function Verificar({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string; volver?: string }>
}) {
  const { correo, volver } = await searchParams

  // Sin correo no hay nada que verificar: se vuelve al registro.
  if (!correo) redirect('/crear-cuenta')

  const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/mi-cuenta'

  return (
    <CajaAuth
      titulo="Confirma tu correo"
      bajada="Un último paso y tu cuenta queda lista."
      pie={
        <>
          ¿Te equivocaste de correo?{' '}
          <Link href="/crear-cuenta" className="font-semibold text-rosa-hondo hover:underline">
            Vuelve a empezar
          </Link>
        </>
      }
    >
      <FormularioCodigo correo={correo} volver={destino} />
    </CajaAuth>
  )
}
