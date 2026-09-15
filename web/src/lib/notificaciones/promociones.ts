import 'server-only'
import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'
import { NEGOCIO, SITIO_URL } from '@/lib/config'
import { precio } from '@/lib/formato'
import { obtenerProductos } from '@/lib/catalogo'
import type { Producto } from '@/lib/tipos'

/**
 * Envío de novedades a quien lo aceptó.
 *
 * Tres reglas que no se negocian, porque son las que separan un correo
 * esperado de uno denunciado como spam:
 *  1. Solo van a quien marcó la casilla y no se ha dado de baja.
 *  2. Cada correo lleva su enlace de baja, que funciona de verdad.
 *  3. Se envía en lotes con pausa, para no quemar la reputación del dominio.
 */

const clave = process.env.RESEND_API_KEY
const remitente = process.env.RESEND_FROM ?? 'Jabones Mari <pedidos@jabonesmari.shop>'

const resend = clave ? new Resend(clave) : null

const COLORES = {
  crema: '#fcf8f4',
  rosa: '#e07fae',
  rosaHondo: '#b14372',
  tinta: '#2e2328',
  tintaMedia: '#6e5a62',
  linea: '#e9dacf',
}

type Destinatario = { correo: string; nombre: string | null; tokenBaja: string }

async function destinatariosActivos(): Promise<Destinatario[]> {
  if (!db) return []

  const filas = await db
    .select({
      correo: esquema.suscriptoresCorreo.correo,
      nombre: esquema.suscriptoresCorreo.nombre,
      tokenBaja: esquema.suscriptoresCorreo.tokenBaja,
    })
    .from(esquema.suscriptoresCorreo)
    .where(eq(esquema.suscriptoresCorreo.acepta, true))

  return filas
}

function tarjetaProducto(producto: Producto): string {
  const foto = producto.imagenes[0]
  const url = foto?.url?.startsWith('http') ? foto.url : `${SITIO_URL}${foto?.url ?? ''}`
  const desde = Math.min(...producto.variantes.map((v) => v.precio))

  return `
    <td width="50%" style="padding:8px;vertical-align:top">
      <a href="${SITIO_URL}/producto/${producto.slug}" style="text-decoration:none;color:inherit">
        <img src="${url}" width="240" alt="${producto.nombre}"
             style="display:block;width:100%;max-width:240px;border-radius:12px;background:${COLORES.crema}">
        <p style="margin:10px 0 0;color:${COLORES.tinta};font-size:16px;font-weight:600">
          ${producto.nombre}
        </p>
        <p style="margin:2px 0 0;color:${COLORES.tintaMedia};font-size:14px">
          ${producto.claim || ''}
        </p>
        <p style="margin:4px 0 0;color:${COLORES.rosaHondo};font-size:14px;font-weight:600">
          Desde ${precio(desde)}
        </p>
      </a>
    </td>`
}

export type Campana = {
  asunto: string
  titulo: string
  cuerpo: string
  /** Slugs de los productos a mostrar. Vacío = los destacados. */
  productos?: string[]
}

function plantilla(campana: Campana, productos: Producto[], enlaceBaja: string, nombre: string | null): string {
  const saludo = nombre ? `Hola, ${nombre.split(' ')[0]}` : 'Hola'

  const filas: string[] = []
  for (let i = 0; i < productos.length; i += 2) {
    const par = productos.slice(i, i + 2)
    filas.push(
      `<tr>${par.map(tarjetaProducto).join('')}${par.length === 1 ? '<td width="50%"></td>' : ''}</tr>`,
    )
  }

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px 12px;background:${COLORES.crema};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
    <tr>
      <td style="text-align:center;padding-bottom:20px">
        <img src="${SITIO_URL}/logo-mari.png" width="64" height="64" alt="${NEGOCIO.nombre}" style="display:inline-block">
      </td>
    </tr>

    <tr>
      <td style="background:#ffffff;border:1px solid ${COLORES.linea};border-radius:16px;padding:28px 24px">
        <h1 style="margin:0;color:${COLORES.tinta};font-size:24px;font-weight:600">${campana.titulo}</h1>
        <p style="margin:12px 0 0;color:${COLORES.tintaMedia};font-size:16px;line-height:1.65">
          ${saludo}, ${campana.cuerpo}
        </p>

        ${
          productos.length > 0
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px">
                 ${filas.join('')}
               </table>`
            : ''
        }

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px">
          <tr>
            <td>
              <a href="${SITIO_URL}/catalogo"
                 style="display:inline-block;background:${COLORES.rosa};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 28px;border-radius:999px">
                Ver el catálogo
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px;text-align:center;color:${COLORES.tintaMedia};font-size:12px;line-height:1.7">
        ${NEGOCIO.nombre} · ${NEGOCIO.tagline}<br>
        Hecho a mano en ${NEGOCIO.ciudad}<br><br>
        <span style="color:#94808a">
          Recibes este correo porque aceptaste nuestras novedades.<br>
          <a href="${enlaceBaja}" style="color:#94808a;text-decoration:underline">Darte de baja</a>
          — no afecta los correos de tus pedidos.
        </span>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export type ResultadoCampana = {
  enviados: number
  fallidos: number
  destinatarios: number
}

export async function enviarCampana(campana: Campana): Promise<ResultadoCampana> {
  if (!resend) return { enviados: 0, fallidos: 0, destinatarios: 0 }

  const destinatarios = await destinatariosActivos()
  if (destinatarios.length === 0) {
    return { enviados: 0, fallidos: 0, destinatarios: 0 }
  }

  const activos = await obtenerProductos()
  const elegidos =
    campana.productos && campana.productos.length > 0
      ? activos.filter((p) => campana.productos!.includes(p.slug))
      : activos.filter((p) => p.destacado).slice(0, 4)

  let enviados = 0
  let fallidos = 0

  // Lotes de 50, que es el máximo de la API por llamada.
  const TAMANO_LOTE = 50

  for (let i = 0; i < destinatarios.length; i += TAMANO_LOTE) {
    const lote = destinatarios.slice(i, i + TAMANO_LOTE)

    const correos = lote.map((d) => ({
      from: remitente,
      to: [d.correo],
      subject: campana.asunto,
      html: plantilla(campana, elegidos, `${SITIO_URL}/baja?t=${d.tokenBaja}`, d.nombre),
      headers: {
        // Gmail y Outlook muestran su propio botón de baja con esto, y eso
        // reduce muchísimo que la gente marque el correo como spam.
        'List-Unsubscribe': `<${SITIO_URL}/baja?t=${d.tokenBaja}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }))

    const { data, error } = await resend.batch.send(correos)

    if (error) {
      console.error('[promociones] falló un lote:', error.message)
      fallidos += lote.length
    } else {
      enviados += data?.data?.length ?? lote.length
    }

    // Pausa entre lotes: el límite por defecto es de 2 peticiones por segundo.
    if (i + TAMANO_LOTE < destinatarios.length) {
      await new Promise((listo) => setTimeout(listo, 1200))
    }
  }

  return { enviados, fallidos, destinatarios: destinatarios.length }
}

/** Cuántas personas recibirían una campaña ahora mismo. */
export async function contarDestinatarios(): Promise<number> {
  return (await destinatariosActivos()).length
}
