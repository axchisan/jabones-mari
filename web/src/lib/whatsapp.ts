import { NEGOCIO, SITIO_URL } from '@/lib/config'
import { precio, telefonoLegible } from '@/lib/formato'
import { ETIQUETA_TAMANO, type ItemPedido } from '@/lib/tipos'

export type DatosMensaje = {
  codigo: string
  clienteNombre: string
  telefono: string
  direccion?: string | null
  barrio?: string | null
  notas?: string | null
  items: ItemPedido[]
  subtotal: number
}

/** Si el pedido es enorme, la URL de wa.me se vuelve frágil: se resume. */
const MAX_LINEAS_ITEM = 15

const dominio = SITIO_URL.replace(/^https?:\/\//, '')

export function construirMensaje(datos: DatosMensaje): string {
  const lineas: string[] = []

  lineas.push(`¡Hola ${NEGOCIO.nombreCorto}! 🦋 Quiero hacer este pedido:`)
  lineas.push('')
  lineas.push(`*Pedido ${datos.codigo}*`)
  lineas.push('')

  const visibles = datos.items.slice(0, MAX_LINEAS_ITEM)
  for (const item of visibles) {
    const total = precio(item.precio * item.cantidad)
    lineas.push(
      `• ${item.cantidad} × ${item.nombre} (${ETIQUETA_TAMANO[item.tamano]}) — ${total}`,
    )
  }
  const restantes = datos.items.length - visibles.length
  if (restantes > 0) {
    lineas.push(`• …y ${restantes} producto${restantes === 1 ? '' : 's'} más`)
  }

  lineas.push('')
  lineas.push(`Subtotal: ${precio(datos.subtotal)}`)
  lineas.push('')
  lineas.push('*Mis datos*')
  lineas.push(`Nombre: ${datos.clienteNombre}`)
  lineas.push(`Teléfono: ${telefonoLegible(datos.telefono)}`)
  if (datos.direccion) lineas.push(`Dirección: ${datos.direccion}`)
  if (datos.barrio) lineas.push(`Barrio: ${datos.barrio}`)
  if (datos.notas) lineas.push(`Notas: ${datos.notas}`)

  lineas.push('')
  lineas.push(`Enviado desde ${dominio}`)

  return lineas.join('\n')
}

export function enlacePedido(datos: DatosMensaje): string {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(construirMensaje(datos))}`
}

/** Enlace para que la dueña le escriba a la clienta desde el panel. */
export function enlaceACliente(telefono: string, mensaje?: string): string {
  const limpio = telefono.replace(/\D/g, '')
  const conIndicativo = limpio.length === 10 ? `57${limpio}` : limpio
  const base = `https://wa.me/${conIndicativo}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}
