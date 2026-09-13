import { NextResponse } from 'next/server'
import { crearPedido } from '@/lib/pedidos'
import { nuevoPedidoSchema } from '@/lib/validacion'
import { construirMensaje } from '@/lib/whatsapp'

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
    const pedido = await crearPedido({
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

    return NextResponse.json({ codigo: pedido.codigo, id: pedido.id, mensaje })
  } catch (error) {
    console.error('[pedidos] no se pudo registrar el pedido', error)
    return NextResponse.json(
      { error: 'No pudimos registrar el pedido. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}
