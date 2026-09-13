import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CajaAuth } from '@/components/auth/campos'
import { FormularioIngreso } from '@/components/auth/formulario-ingreso'
import { hayGoogle } from '@/lib/auth/servidor'
import { obtenerSesion, esAdmin } from '@/lib/auth/sesion'

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Entra a tu cuenta para ver tus pedidos.',
  robots: { index: false, follow: false },
}

export default async function Ingresar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>
}) {
  const { volver } = await searchParams
  const sesion = await obtenerSesion()

  if (sesion?.user) {
    redirect(esAdmin(sesion.user) ? '/admin' : '/mi-cuenta')
  }

  // Solo se acepta volver a rutas internas: un destino externo sería
  // una puerta abierta a redirecciones maliciosas.
  const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/mi-cuenta'

  return (
    <CajaAuth
      titulo="Qué bueno verte"
      bajada="Entra para ver tus pedidos y guardar tus datos de entrega."
      pie="Tu información solo se usa para coordinar tus pedidos."
    >
      <FormularioIngreso volver={destino} conGoogle={hayGoogle} />
    </CajaAuth>
  )
}
