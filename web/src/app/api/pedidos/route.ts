import { NextResponse } from 'next/server'
import { crearPedido } from '@/lib/pedidos'
import { nuevoPedidoSchema } from '@/lib/validacion'
import { construirMensaje } from '@/lib/whatsapp'
import { obtenerSesion } from '@/lib/auth/sesion'
import { avisarAdministracion } from '@/lib/notificaciones/push'
import { precio } from '@/lib/formato'

export async function POST(peticion: Request) {
  let cuerpo: unknown
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const resultado = nuevoPedidoSchema.safeParse(cuerpo)
  if (!resultado.success) {
    return NextResponse.json(
      {
        error: 'Revisa los datos del pedido',
        detalles: resultado.error.flatten().fieldErrors,
      },
      { status: 422 },
    )
  }

  const datos = resultado.data

  try {
    // Si la clienta tiene sesión, el pedido queda en su historial.
    const sesion = await obtenerSesion()

    const pedido = await crearPedido({
      usuarioId: sesion?.user?.id ?? null,
      clienteNombre: datos.clienteNombre,
      telefono: datos.telefono,
      direccion: datos.direccion || null,
      barrio: datos.barrio || null,
      notas: datos.notas || null,
      items: datos.items,
    })

    const mensaje = construirMensaje({
      codigo: pedido.codigo,
      clienteNombre: pedido.clienteNombre,
      telefono: pedido.telefono,
      direccion: pedido.direccion,
      barrio: pedido.barrio,
      notas: pedido.notas,
      items: pedido.items,
      subtotal: pedido.subtotal,
    })

    // El aviso no debe retrasar ni tumbar la respuesta: si falla, el pedido
    // ya está guardado y se ve igual en el panel.
    const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0)

    avisarAdministracion({
      titulo: `Pedido nuevo · ${precio(pedido.total)}`,
      cuerpo: `${pedido.clienteNombre} pidió ${unidades} ${unidades === 1 ? 'jabón' : 'jabones'}. Código ${pedido.codigo}.`,
      url: `/admin/pedidos/${pedido.id}`,
      etiqueta: `pedido-${pedido.codigo}`,
    }).catch((error) => {
      console.error('[pedidos] no se pudo avisar por notificación', error)
    })

    return NextResponse.json({ codigo: pedido.codigo, id: pedido.id, mensaje })
  } catch (error) {
    console.error('[pedidos] no se pudo registrar el pedido', error)
    return NextResponse.json(
      { error: 'No pudimos registrar el pedido. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}
