import 'server-only'
import { Resend } from 'resend'
import { NEGOCIO, SITIO_URL } from '@/lib/config'
import { precio, fechaLegible, telefonoLegible } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Pedido } from '@/lib/tipos'

/**
 * Aviso de pedido por correo.
 *
 * Es el respaldo de la notificación push: llega aunque el celular esté sin
 * batería, sin la aplicación instalada o con los permisos revocados, y deja
 * un registro consultable del pedido.
 */

const clave = process.env.RESEND_API_KEY
const remitente = process.env.RESEND_FROM ?? 'Jabones Mari <pedidos@jabonesmari.shop>'

/** A quién se avisa. Varios correos separados por coma. */
const destinatarios = (process.env.NOTIFICAR_A ?? '')
  .split(',')
  .map((correo) => correo.trim())
  .filter(Boolean)

export const hayCorreo = Boolean(clave && destinatarios.length > 0)

const resend = clave ? new Resend(clave) : null

const COLORES = {
  crema: '#fcf8f4',
  rosa: '#e07fae',
  rosaHondo: '#b14372',
  tinta: '#2e2328',
  tintaMedia: '#6e5a62',
  linea: '#e9dacf',
}

function filaItem(nombre: string, detalle: string, total: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORES.linea}">
        <span style="color:${COLORES.tinta};font-size:15px;font-weight:600">${nombre}</span><br>
        <span style="color:${COLORES.tintaMedia};font-size:13px">${detalle}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid ${COLORES.linea};color:${COLORES.tinta};font-size:15px;white-space:nowrap">
        ${total}
      </td>
    </tr>`
}

/** El correo se arma con tablas y estilos en línea: es lo único fiable en clientes de correo. */
function plantilla(pedido: Pedido): string {
  const items = pedido.items
    .map((item) =>
      filaItem(
        item.nombre,
        `${ETIQUETA_TAMANO[item.tamano]} · ${item.cantidad} × ${precio(item.precio)}`,
        precio(item.precio * item.cantidad),
      ),
    )
    .join('')

  const enlaceCliente = `https://wa.me/57${pedido.telefono.replace(/\D/g, '').slice(-10)}`

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px 12px;background:${COLORES.crema};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
    <tr>
      <td style="padding-bottom:16px">
        <span style="display:inline-block;background:${COLORES.rosa};color:#ffffff;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;border-radius:999px">
          Pedido nuevo
        </span>
      </td>
    </tr>

    <tr>
      <td style="background:#ffffff;border:1px solid ${COLORES.linea};border-radius:16px;padding:24px">
        <p style="margin:0;color:${COLORES.tintaMedia};font-size:13px">${fechaLegible(pedido.creadoEn)}</p>
        <h1 style="margin:4px 0 0;color:${COLORES.tinta};font-size:26px;font-weight:600">${pedido.codigo}</h1>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
          ${items}
          <tr>
            <td style="padding:14px 0 0;color:${COLORES.tintaMedia};font-size:15px">Total</td>
            <td align="right" style="padding:14px 0 0;color:${COLORES.tinta};font-size:22px;font-weight:700">
              ${precio(pedido.total)}
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:${COLORES.crema};border-radius:12px">
          <tr>
            <td style="padding:16px">
              <p style="margin:0 0 8px;color:${COLORES.rosaHondo};font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">
                Datos de entrega
              </p>
              <p style="margin:0;color:${COLORES.tinta};font-size:15px;line-height:1.7">
                <strong>${pedido.clienteNombre}</strong><br>
                ${telefonoLegible(pedido.telefono)}
                ${pedido.direccion ? `<br>${pedido.direccion}` : ''}
                ${pedido.barrio ? `<br>${pedido.barrio}` : ''}
              </p>
              ${
                pedido.notas
                  ? `<p style="margin:12px 0 0;padding-top:12px;border-top:1px solid ${COLORES.linea};color:${COLORES.tintaMedia};font-size:14px;line-height:1.6">
                       <strong style="color:${COLORES.tinta}">Nota:</strong> ${pedido.notas}
                     </p>`
                  : ''
              }
            </td>
          </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px">
          <tr>
            <td style="padding-right:10px">
              <a href="${SITIO_URL}/admin/pedidos/${pedido.id}"
                 style="display:inline-block;background:${COLORES.rosa};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:999px">
                Ver el pedido
              </a>
            </td>
            <td>
              <a href="${enlaceCliente}"
                 style="display:inline-block;background:#128c4a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:999px">
                Escribirle
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding-top:18px;text-align:center;color:${COLORES.tintaMedia};font-size:12px;line-height:1.6">
        ${NEGOCIO.nombre} · ${NEGOCIO.tagline}<br>
        Este aviso se envía solo cuando entra un pedido por ${SITIO_URL.replace(/^https?:\/\//, '')}
      </td>
    </tr>
  </table>
</body>
</html>`
}

function versionTexto(pedido: Pedido): string {
  const lineas = pedido.items.map(
    (i) =>
      `- ${i.cantidad} x ${i.nombre} (${ETIQUETA_TAMANO[i.tamano]}) ${precio(i.precio * i.cantidad)}`,
  )

  return [
    `Pedido nuevo ${pedido.codigo}`,
    '',
    ...lineas,
    '',
    `Total: ${precio(pedido.total)}`,
    '',
    `Cliente: ${pedido.clienteNombre}`,
    `Teléfono: ${telefonoLegible(pedido.telefono)}`,
    pedido.direccion ? `Dirección: ${pedido.direccion}` : '',
    pedido.barrio ? `Barrio: ${pedido.barrio}` : '',
    pedido.notas ? `Nota: ${pedido.notas}` : '',
    '',
    `Verlo en el panel: ${SITIO_URL}/admin/pedidos/${pedido.id}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function avisarPedidoPorCorreo(pedido: Pedido): Promise<boolean> {
  if (!hayCorreo || !resend) return false

  // El SDK de Resend no lanza excepciones: devuelve { data, error }.
  const { error } = await resend.emails.send(
    {
      from: remitente,
      to: destinatarios,
      subject: `Pedido nuevo ${pedido.codigo} · ${precio(pedido.total)}`,
      html: plantilla(pedido),
      text: versionTexto(pedido),
      replyTo: destinatarios[0],
    },
    // Evita duplicados si la petición se reintenta.
    { idempotencyKey: `pedido-nuevo/${pedido.id}` },
  )

  if (error) {
    console.error('[correo] no se pudo enviar el aviso:', error.message)
    return false
  }

  return true
}

/** Correo de prueba, para comprobar la configuración desde el panel. */
export async function probarCorreo(): Promise<{ ok: boolean; detalle: string }> {
  if (!resend) {
    return { ok: false, detalle: 'Falta RESEND_API_KEY' }
  }
  if (destinatarios.length === 0) {
    return { ok: false, detalle: 'Falta NOTIFICAR_A con el correo de destino' }
  }

  const { error } = await resend.emails.send({
    from: remitente,
    to: destinatarios,
    subject: 'Prueba de avisos · Jabones Mari',
    html: `<p style="font-family:sans-serif;font-size:16px;color:#2e2328">
             Si ves este correo, los avisos de pedidos van a llegar bien. 🦋
           </p>`,
    text: 'Si ves este correo, los avisos de pedidos van a llegar bien.',
  })

  if (error) {
    return { ok: false, detalle: error.message }
  }

  return {
    ok: true,
    detalle: `Enviado a ${destinatarios.join(', ')}`,
  }
}
