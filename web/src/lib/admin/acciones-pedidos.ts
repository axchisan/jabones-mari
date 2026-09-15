'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requerirAdmin } from '@/lib/auth/sesion'
import {
  actualizarPedido,
  eliminarPedido as borrarPedido,
  obtenerPedido,
} from '@/lib/pedidos'
import { obtenerVariante, obtenerProductoPorId, obtenerTodosLosProductos } from '@/lib/catalogo'
import {
  descontarPorEntrega,
  devolverAlInventario,
  revisarDisponibilidad,
  mensajeDeFaltas,
} from '@/lib/inventario'
import { ESTADOS_PEDIDO, type EstadoPedido, type ItemPedido } from '@/lib/tipos'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'

/**
 * Un pedido entra "abierto" y se queda así hasta que alguien lo confirma en
 * el chat. Mientras tanto se puede editar entero: cambiar cantidades, agregar
 * jabones que la clienta pidió por WhatsApp, corregir la dirección o anotar
 * observaciones internas.
 */

function refrescar(id?: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/pedidos')
  revalidatePath('/mi-cuenta')
  if (id) revalidatePath(`/admin/pedidos/${id}`)
}

export async function cambiarEstado(
  id: string,
  estado: EstadoPedido,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  if (!ESTADOS_PEDIDO.includes(estado)) {
    return { ok: false, error: 'Ese estado no existe' }
  }

  const antes = await obtenerPedido(id)
  if (!antes) return { ok: false, error: 'No encontramos ese pedido' }

  const pedido = await actualizarPedido(id, { estado })
  if (!pedido) return { ok: false, error: 'No encontramos ese pedido' }

  // El inventario se mueve al entregar, no al pedir: mientras el pedido está
  // vivo sus unidades cuentan como apartadas y ya no se pueden vender dos
  // veces. Al entregar salen de verdad; si se deshace la entrega, vuelven.
  if (antes.estado !== 'entregado' && estado === 'entregado') {
    await descontarPorEntrega(pedido.items)
  } else if (antes.estado === 'entregado' && estado !== 'entregado') {
    await devolverAlInventario(pedido.items)
  }

  refrescar(id)
  revalidatePath('/catalogo')

  return { ok: true, mensaje: `${pedido.codigo} quedó como ${estado.replace('_', ' ')}` }
}

const esquemaDatos = z.object({
  clienteNombre: z.string().trim().min(2, 'El nombre es obligatorio').max(80),
  telefono: z
    .string()
    .trim()
    .transform((valor) => valor.replace(/\D/g, ''))
    .refine((valor) => /^3\d{9}$/.test(valor), {
      message: 'El celular debe tener 10 dígitos y empezar por 3',
    }),
  direccion: z.string().trim().max(160),
  barrio: z.string().trim().max(80),
  notas: z.string().trim().max(400),
  observacionesInternas: z.string().trim().max(1000),
  domicilio: z.coerce.number().int().min(0).max(1_000_000),
})

export async function guardarDatosPedido(
  _previo: ResultadoAccion | null,
  datos: FormData,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  const id = String(datos.get('id') ?? '').trim()
  if (!id) return { ok: false, error: 'Falta el pedido' }

  const analisis = esquemaDatos.safeParse({
    clienteNombre: datos.get('clienteNombre'),
    telefono: datos.get('telefono'),
    direccion: datos.get('direccion') ?? '',
    barrio: datos.get('barrio') ?? '',
    notas: datos.get('notas') ?? '',
    observacionesInternas: datos.get('observacionesInternas') ?? '',
    domicilio: datos.get('domicilio') || 0,
  })

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' }
  }

  const valores = analisis.data

  const pedido = await actualizarPedido(id, {
    clienteNombre: valores.clienteNombre,
    telefono: valores.telefono,
    direccion: valores.direccion || null,
    barrio: valores.barrio || null,
    notas: valores.notas || null,
    observacionesInternas: valores.observacionesInternas || null,
    domicilio: valores.domicilio,
  })

  if (!pedido) return { ok: false, error: 'No encontramos ese pedido' }

  refrescar(id)
  return { ok: true, mensaje: 'Pedido actualizado' }
}

export async function cambiarCantidad(
  id: string,
  varianteId: string,
  cantidad: number,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  const pedido = await obtenerPedido(id)
  if (!pedido) return { ok: false, error: 'No encontramos ese pedido' }

  const items =
    cantidad <= 0
      ? pedido.items.filter((i) => i.varianteId !== varianteId)
      : pedido.items.map((i) =>
          i.varianteId === varianteId ? { ...i, cantidad: Math.min(cantidad, 999) } : i,
        )

  // Subir una cantidad a mano tiene el mismo tope que la tienda. Se excluye
  // este pedido del cálculo: sus propias líneas ya están apartadas y si no,
  // se restarían dos veces.
  if (cantidad > 0 && pedido.estado !== 'entregado' && pedido.estado !== 'cancelado') {
    const faltas = await revisarDisponibilidad(items, {
      exceptoPedido: id,
      permitirOcultas: true,
    })
    if (faltas.length > 0) return { ok: false, error: mensajeDeFaltas(faltas) }
  }

  await actualizarPedido(id, { items })
  refrescar(id)

  return {
    ok: true,
    mensaje: cantidad <= 0 ? 'Producto quitado del pedido' : 'Cantidad actualizada',
  }
}

export async function agregarItem(
  id: string,
  varianteId: string,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  const [pedido, variante] = await Promise.all([
    obtenerPedido(id),
    obtenerVariante(varianteId),
  ])

  if (!pedido) return { ok: false, error: 'No encontramos ese pedido' }
  if (!variante) return { ok: false, error: 'No encontramos esa presentación' }

  const yaEsta = pedido.items.find((i) => i.varianteId === varianteId)

  if (yaEsta) {
    return cambiarCantidad(id, varianteId, yaEsta.cantidad + 1)
  }

  const producto = await obtenerProductoPorId(variante.productoId)
  if (!producto) return { ok: false, error: 'No encontramos ese producto' }

  // Se congela el precio del momento, igual que en el carrito de la tienda.
  const nuevo: ItemPedido = {
    varianteId: variante.id,
    productoSlug: producto.slug,
    nombre: producto.nombre,
    tamano: variante.tamano,
    precio: variante.precio,
    cantidad: 1,
  }

  if (pedido.estado !== 'entregado' && pedido.estado !== 'cancelado') {
    const faltas = await revisarDisponibilidad([nuevo], {
      exceptoPedido: id,
      permitirOcultas: true,
    })
    if (faltas.length > 0) return { ok: false, error: mensajeDeFaltas(faltas) }
  }

  await actualizarPedido(id, { items: [...pedido.items, nuevo] })
  refrescar(id)

  return { ok: true, mensaje: `${producto.nombre} agregado al pedido` }
}

export async function eliminarPedido(id: string): Promise<ResultadoAccion> {
  await requerirAdmin()

  const pedido = await obtenerPedido(id)
  if (!pedido) return { ok: false, error: 'No encontramos ese pedido' }

  await borrarPedido(id)
  refrescar()

  return { ok: true, mensaje: `${pedido.codigo} fue eliminado` }
}

/** Presentaciones disponibles, para el selector de "agregar al pedido". */
export async function opcionesParaAgregar() {
  await requerirAdmin()
  const productos = await obtenerTodosLosProductos()

  return productos.flatMap((producto) =>
    producto.variantes.map((variante) => ({
      varianteId: variante.id,
      etiqueta: `${producto.nombre} · ${variante.tamano === 'grande' ? 'Grande' : 'Pequeño'}`,
      precio: variante.precio,
      disponible: variante.disponible,
      disponibles: variante.disponibles,
    })),
  )
}
