import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { crearPedido } from '@/lib/pedidos'
import { armarItemsDesdeCatalogo } from '@/lib/catalogo'
import { revisarDisponibilidad, mensajeDeFaltas } from '@/lib/inventario'
import { nuevoPedidoSchema } from '@/lib/validacion'
import { construirMensaje } from '@/lib/whatsapp'
import { obtenerSesion } from '@/lib/auth/sesion'
import { avisarAdministracion } from '@/lib/notificaciones/push'
import { avisarPedidoPorCorreo, confirmarPedidoAlCliente } from '@/lib/notificaciones/correo'
import { registrarConsentimiento } from '@/lib/notificaciones/suscriptores'
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
    // El carrito vive en el navegador, así que llega con precios y nombres que
    // cualquiera puede haber editado. Se rehace desde el catálogo antes de
    // guardar nada: lo único que se respeta del cliente es qué y cuántos.
    const { items, descartadas } = await armarItemsDesdeCatalogo(datos.items)

    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            descartadas.length > 0
              ? 'Los jabones de tu carrito ya no están disponibles. Vuelve al catálogo y ármalo de nuevo.'
              : 'El carrito está vacío.',
        },
        { status: 409 },
      )
    }

    // Y se comprueba que haya existencias de verdad. Lo disponible descuenta
    // lo ya apartado en pedidos vivos, no solo lo que dice el stock.
    const faltas = await revisarDisponibilidad(items)

    if (faltas.length > 0) {
      return NextResponse.json(
        { error: mensajeDeFaltas(faltas), faltas },
        { status: 409 },
      )
    }

    // Si la clienta tiene sesión, el pedido queda en su historial.
    const sesion = await obtenerSesion()

    const pedido = await crearPedido({
      usuarioId: sesion?.user?.id ?? null,
      clienteNombre: datos.clienteNombre,
      telefono: datos.telefono,
      correo: datos.correo || null,
      aceptaPromociones: Boolean(datos.aceptaPromociones && datos.correo),
      direccion: datos.direccion || null,
      barrio: datos.barrio || null,
      notas: datos.notas || null,
      items,
    })

    // Lo que acaba de apartarse ya no está disponible para la siguiente
    // clienta: el catálogo publicado deja de ser cierto en ese momento.
    revalidatePath('/catalogo')
    for (const slug of new Set(pedido.items.map((i) => i.productoSlug))) {
      revalidatePath(`/producto/${slug}`)
    }

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

    // El consentimiento se registra antes de los correos: el de confirmación
    // necesita el token de baja si la clienta aceptó promociones.
    if (pedido.aceptaPromociones && pedido.correo) {
      try {
        await registrarConsentimiento(pedido.correo, pedido.clienteNombre, 'pedido')
      } catch (error) {
        console.error('[pedidos] no se pudo registrar el consentimiento', error)
      }
    }

    Promise.allSettled([
      avisarAdministracion({
        titulo: `Pedido nuevo · ${precio(pedido.total)}`,
        cuerpo: `${pedido.clienteNombre} pidió ${unidades} ${unidades === 1 ? 'jabón' : 'jabones'}. Código ${pedido.codigo}.`,
        url: `/admin/pedidos/${pedido.id}`,
        etiqueta: `pedido-${pedido.codigo}`,
      }),
      avisarPedidoPorCorreo(pedido),
      confirmarPedidoAlCliente(pedido),
    ]).then((resultados) => {
      for (const resultado of resultados) {
        if (resultado.status === 'rejected') {
          console.error('[pedidos] falló un aviso', resultado.reason)
        }
      }
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
