import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CajaAuth } from '@/components/auth/campos'
import { FormularioRegistro } from '@/components/auth/formulario-registro'
import { hayGoogle } from '@/lib/auth/servidor'
import { obtenerSesion, esAdmin } from '@/lib/auth/sesion'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta para seguir tus pedidos.',
  robots: { index: false, follow: false },
}

export default async function CrearCuenta({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>
}) {
  const { volver } = await searchParams
  const sesion = await obtenerSesion()

  if (sesion?.user) {
    redirect(esAdmin(sesion.user) ? '/admin' : '/mi-cuenta')
  }

  const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/mi-cuenta'

  return (
    <CajaAuth
      titulo="Crea tu cuenta"
      bajada="Para seguir tus pedidos y no volver a escribir tus datos cada vez."
      pie="No necesitas cuenta para comprar: también puedes pedir como invitada."
    >
      <FormularioRegistro volver={destino} conGoogle={hayGoogle} />
    </CajaAuth>
  )
}
