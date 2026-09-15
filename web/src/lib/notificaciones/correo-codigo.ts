import 'server-only'
import { Resend } from 'resend'
import { NEGOCIO, SITIO_URL } from '@/lib/config'

/** Correo con el código de verificación. Corto y sin nada que distraiga. */

const clave = process.env.RESEND_API_KEY
const remitente = process.env.RESEND_FROM ?? 'Jabones Mari <pedidos@jabonesmari.shop>'
const resend = clave ? new Resend(clave) : null

const COLORES = {
  crema: '#fcf8f4',
  rosaHondo: '#b14372',
  tinta: '#2e2328',
  tintaMedia: '#6e5a62',
  linea: '#e9dacf',
}

const TEXTOS = {
  'sign-in': {
    asunto: 'Tu código para entrar',
    titulo: 'Tu código para entrar',
    razon: 'Pediste entrar a tu cuenta de Jabones Mari.',
  },
  'email-verification': {
    asunto: 'Confirma tu correo',
    titulo: 'Confirma tu correo',
    razon: 'Estás creando tu cuenta en Jabones Mari.',
  },
  'forget-password': {
    asunto: 'Tu código para cambiar la contraseña',
    titulo: 'Cambia tu contraseña',
    razon: 'Pediste cambiar la contraseña de tu cuenta.',
  },
} as const

export type TipoCodigo = keyof typeof TEXTOS

export async function enviarCodigo(
  correo: string,
  codigo: string,
  tipo: TipoCodigo,
): Promise<void> {
  if (!resend) {
    // Sin Resend configurado, el código va al registro del servidor para no
    // bloquear el desarrollo local.
    console.warn(`[codigo] ${tipo} para ${correo}: ${codigo}`)
    return
  }

  const t = TEXTOS[tipo] ?? TEXTOS['email-verification']

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px 12px;background:${COLORES.crema};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;margin:0 auto">
    <tr>
      <td style="text-align:center;padding-bottom:20px">
        <img src="${SITIO_URL}/logo-mari.png" width="56" height="56" alt="${NEGOCIO.nombre}" style="display:inline-block">
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;border:1px solid ${COLORES.linea};border-radius:16px;padding:28px 24px;text-align:center">
        <h1 style="margin:0;color:${COLORES.tinta};font-size:22px;font-weight:600">${t.titulo}</h1>
        <p style="margin:10px 0 0;color:${COLORES.tintaMedia};font-size:15px;line-height:1.6">
          ${t.razon} Escribe este código para continuar:
        </p>
        <p style="margin:24px 0;font-size:36px;font-weight:700;letter-spacing:.28em;color:${COLORES.rosaHondo};font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
          ${codigo}
        </p>
        <p style="margin:0;color:${COLORES.tintaMedia};font-size:13px;line-height:1.6">
          Caduca en 10 minutos.<br>
          Si no fuiste tú, ignora este correo: no pasa nada.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:18px;text-align:center;color:${COLORES.tintaMedia};font-size:12px">
        ${NEGOCIO.nombre} · ${NEGOCIO.tagline}
      </td>
    </tr>
  </table>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: remitente,
    to: [correo],
    subject: `${t.asunto} · ${NEGOCIO.nombre}`,
    html,
    text: `${t.razon}\n\nTu código es: ${codigo}\n\nCaduca en 10 minutos. Si no fuiste tú, ignora este correo.`,
  })

  if (error) {
    console.error('[codigo] no se pudo enviar:', error.message)
    throw new Error('No se pudo enviar el código')
  }
}
