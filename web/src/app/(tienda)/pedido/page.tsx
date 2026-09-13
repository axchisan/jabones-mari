import type { Metadata } from 'next'
import { FormularioPedido } from '@/components/formulario-pedido'

export const metadata: Metadata = {
  title: 'Confirma tu pedido',
  description:
    'Déjanos tus datos y te llevamos al chat de WhatsApp con el pedido ya armado para confirmarlo.',
  robots: { index: false, follow: false },
}

export default function PaginaPedido() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FormularioPedido />
    </div>
  )
}
