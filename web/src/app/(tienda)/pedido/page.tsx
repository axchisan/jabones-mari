import type { Metadata } from 'next'
import { FormularioPedido } from '@/components/formulario-pedido'
import { obtenerUsuario } from '@/lib/auth/sesion'

export const metadata: Metadata = {
  title: 'Confirma tu pedido',
  description:
    'Déjanos tus datos y te llevamos al chat de WhatsApp con el pedido ya armado para confirmarlo.',
  robots: { index: false, follow: false },
}

export default async function PaginaPedido() {
  // Si ya entró y guardó sus datos, no hay por qué volver a pedírselos.
  const usuario = await obtenerUsuario()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FormularioPedido
        inicial={
          usuario
            ? {
                clienteNombre: usuario.name ?? '',
                correo: usuario.email ?? '',
                telefono: usuario.telefono ?? '',
                direccion: usuario.direccion ?? '',
                barrio: usuario.barrio ?? '',
              }
            : undefined
        }
      />
    </div>
  )
}
