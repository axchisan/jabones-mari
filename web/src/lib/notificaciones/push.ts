import 'server-only'
import webpush from 'web-push'
import { randomUUID } from 'node:crypto'
import { eq, inArray } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'
import { SITIO_URL } from '@/lib/config'

/**
 * Notificaciones push del panel.
 *
 * Sirven para el caso que de otro modo se pierde: la clienta confirma el
 * pedido en la web pero no llega a enviar el mensaje de WhatsApp. El pedido
 * queda registrado y, sin esto, nadie se entera.
 *
 * Se usa Web Push con VAPID: gratis, sin intermediarios y llega al celular
 * como cualquier otra notificación, siempre que el panel esté instalado
 * como aplicación.
 */

const publica = process.env.VAPID_PUBLIC_KEY
const privada = process.env.VAPID_PRIVATE_KEY
const asunto = process.env.VAPID_SUBJECT ?? 'mailto:hola@jabonesmari.shop'

export const hayPush = Boolean(publica && privada)

if (hayPush) {
  webpush.setVapidDetails(asunto, publica!, privada!)
}

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL')
  return db
}

export type DatosSuscripcion = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function guardarSuscripcion(
  usuarioId: string,
  suscripcion: DatosSuscripcion,
  dispositivo?: string | null,
): Promise<void> {
  const conexion = baseDeDatos()

  // El endpoint es único por navegador: si ya existe, solo se refrescan las
  // llaves, que el navegador puede rotar.
  await conexion
    .insert(esquema.suscripcionesPush)
    .values({
      id: randomUUID(),
      usuarioId,
      endpoint: suscripcion.endpoint,
      p256dh: suscripcion.keys.p256dh,
      auth: suscripcion.keys.auth,
      dispositivo: dispositivo ?? null,
    })
    .onConflictDoUpdate({
      target: esquema.suscripcionesPush.endpoint,
      set: {
        usuarioId,
        p256dh: suscripcion.keys.p256dh,
        auth: suscripcion.keys.auth,
        dispositivo: dispositivo ?? null,
      },
    })
}

export async function borrarSuscripcion(endpoint: string): Promise<void> {
  await baseDeDatos()
    .delete(esquema.suscripcionesPush)
    .where(eq(esquema.suscripcionesPush.endpoint, endpoint))
}

export async function contarSuscripciones(usuarioId: string): Promise<number> {
  const filas = await baseDeDatos()
    .select({ id: esquema.suscripcionesPush.id })
    .from(esquema.suscripcionesPush)
    .where(eq(esquema.suscripcionesPush.usuarioId, usuarioId))
  return filas.length
}

export type Aviso = {
  titulo: string
  cuerpo: string
  url?: string
  etiqueta?: string
}

/**
 * Envía un aviso a todos los dispositivos registrados.
 *
 * Las suscripciones caducadas se borran solas: cuando el navegador responde
 * 404 o 410, ese dispositivo ya no existe y guardarlo solo estorba.
 */
export async function avisarAdministracion(aviso: Aviso): Promise<{
  enviados: number
  fallidos: number
}> {
  if (!hayPush) return { enviados: 0, fallidos: 0 }

  const conexion = baseDeDatos()
  const suscripciones = await conexion.select().from(esquema.suscripcionesPush)

  if (suscripciones.length === 0) return { enviados: 0, fallidos: 0 }

  const carga = JSON.stringify({
    titulo: aviso.titulo,
    cuerpo: aviso.cuerpo,
    url: aviso.url ?? `${SITIO_URL}/admin/pedidos`,
    etiqueta: aviso.etiqueta ?? 'pedido',
  })

  const caducadas: string[] = []
  let enviados = 0
  let fallidos = 0

  await Promise.all(
    suscripciones.map(async (fila) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: fila.endpoint,
            keys: { p256dh: fila.p256dh, auth: fila.auth },
          },
          carga,
          { TTL: 60 * 60 * 24, urgency: 'high' },
        )
        enviados += 1
      } catch (error) {
        const codigo = (error as { statusCode?: number }).statusCode
        if (codigo === 404 || codigo === 410) {
          caducadas.push(fila.endpoint)
        } else {
          fallidos += 1
          console.error('[push] no se pudo enviar', codigo, fila.endpoint.slice(-12))
        }
      }
    }),
  )

  if (caducadas.length > 0) {
    await conexion
      .delete(esquema.suscripcionesPush)
      .where(inArray(esquema.suscripcionesPush.endpoint, caducadas))
  }

  if (enviados > 0) {
    await conexion
      .update(esquema.suscripcionesPush)
      .set({ usadaEn: new Date() })
      .where(inArray(esquema.suscripcionesPush.endpoint, suscripciones.map((s) => s.endpoint)))
  }

  return { enviados, fallidos }
}
