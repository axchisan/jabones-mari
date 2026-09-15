'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requerirAdmin } from '@/lib/auth/sesion'
import { crearPedido } from '@/lib/pedidos'
import { obtenerVariante, obtenerProductoPorId } from '@/lib/catalogo'
import {
  descontarPorEntrega,
  revisarDisponibilidad,
  mensajeDeFaltas,
} from '@/lib/inventario'
import { ESTADOS_PEDIDO, type EstadoPedido, type ItemPedido } from '@/lib/tipos'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'

/**
 * Registro de ventas hechas por fuera de la tienda.
 *
 * Buena parte de las ventas pasan por WhatsApp, en persona o en una feria, y
 * si no quedan en ningún lado las cuentas del negocio no cuadran. Esto las
 * mete al mismo historial, marcadas como 'manual' para poder distinguir
 * después cuánto vende cada canal.
 */

const esquemaLinea = z.object({
  varianteId: z.string().min(1),
  cantidad: z.coerce.number().int().min(1).max(999),
})

const esquemaVenta = z.object({
  clienteNombre: z.string().trim().min(2, 'Escribe el nombre de la clienta').max(80),
  telefono: z
    .string()
    .trim()
    .transform((valor) => valor.replace(/\D/g, ''))
    .refine((valor) => valor === '' || /^3\d{9}$/.test(valor), {
      message: 'El celular debe tener 10 dígitos y empezar por 3',
    }),
  correo: z.string().trim().toLowerCase().email('Revisa el correo').optional().or(z.literal('')),
  direccion: z.string().trim().max(160),
  barrio: z.string().trim().max(80),
  notasInternas: z.string().trim().max(1000),
  domicilio: z.coerce.number().int().min(0).max(1_000_000),
  estado: z.enum(ESTADOS_PEDIDO),
})

export async function registrarVentaManual(
  _previo: ResultadoAccion | null,
  datos: FormData,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  // Las líneas llegan como pares varianteId/cantidad repetidos.
  const variantes = datos.getAll('varianteId').map(String)
  const cantidades = datos.getAll('cantidad').map(String)

  const lineas = variantes
    .map((varianteId, indice) => ({ varianteId, cantidad: cantidades[indice] ?? '0' }))
    .filter((linea) => linea.varianteId && Number(linea.cantidad) > 0)
    .map((linea) => esquemaLinea.safeParse(linea))
    .filter((r): r is { success: true; data: z.infer<typeof esquemaLinea> } => r.success)
    .map((r) => r.data)

  if (lineas.length === 0) {
    return { ok: false, error: 'Agrega al menos un producto a la venta' }
  }

  const analisis = esquemaVenta.safeParse({
    clienteNombre: datos.get('clienteNombre'),
    telefono: datos.get('telefono') ?? '',
    correo: datos.get('correo') ?? '',
    direccion: datos.get('direccion') ?? '',
    barrio: datos.get('barrio') ?? '',
    notasInternas: datos.get('notasInternas') ?? '',
    domicilio: datos.get('domicilio') || 0,
    estado: datos.get('estado') || 'entregado',
  })

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' }
  }

  const valores = analisis.data

  // Se congela el precio del momento, igual que en el carrito de la tienda.
  const items: ItemPedido[] = []

  for (const linea of lineas) {
    const variante = await obtenerVariante(linea.varianteId)
    if (!variante) continue

    const producto = await obtenerProductoPorId(variante.productoId)
    if (!producto) continue

    items.push({
      varianteId: variante.id,
      productoSlug: producto.slug,
      nombre: producto.nombre,
      tamano: variante.tamano,
      precio: variante.precio,
      cantidad: linea.cantidad,
    })
  }

  if (items.length === 0) {
    return { ok: false, error: 'No encontramos las presentaciones seleccionadas' }
  }

  // Una venta a mano descuenta del mismo inventario que la tienda. Se permiten
  // presentaciones ocultas: si María José la vendió en una feria, la venta ya
  // pasó y hay que registrarla igual.
  const faltas = await revisarDisponibilidad(items, { permitirOcultas: true })
  if (faltas.length > 0) {
    return { ok: false, error: mensajeDeFaltas(faltas) }
  }

  try {
    const pedido = await crearPedido({
      clienteNombre: valores.clienteNombre,
      telefono: valores.telefono || '0000000000',
      correo: valores.correo || null,
      direccion: valores.direccion || null,
      barrio: valores.barrio || null,
      notas: null,
      notasInternas: valores.notasInternas || null,
      items,
      origen: 'manual',
      estado: valores.estado as EstadoPedido,
      domicilio: valores.domicilio,
    })

    // Si nace entregada, el jabón ya salió: el inventario baja de una vez.
    if (pedido.estado === 'entregado') {
      await descontarPorEntrega(pedido.items)
    }

    revalidatePath('/admin')
    revalidatePath('/catalogo')
    revalidatePath('/admin/pedidos')
    revalidatePath('/admin/ventas')

    return {
      ok: true,
      mensaje: `Venta ${pedido.codigo} registrada`,
      id: pedido.id,
    }
  } catch (error) {
    console.error('[admin] no se pudo registrar la venta', error)
    return { ok: false, error: 'No se pudo registrar la venta. Intenta de nuevo.' }
  }
}

/** Las presentaciones disponibles, para el selector del formulario. */
export async function presentacionesParaVender() {
  await requerirAdmin()
  const { obtenerTodosLosProductos } = await import('@/lib/catalogo')
  const productos = await obtenerTodosLosProductos()

  return productos.flatMap((producto) =>
    producto.variantes.map((variante) => ({
      varianteId: variante.id,
      etiqueta: `${producto.nombre} · ${variante.tamano === 'grande' ? 'Grande' : 'Pequeño'}`,
      precio: variante.precio,
      activo: producto.activo,
      disponibles: variante.disponibles,
    })),
  )
}
