'use server'

import { headers } from 'next/headers'
import { requerirAdmin } from '@/lib/auth/sesion'
import {
  guardarSuscripcion,
  borrarSuscripcion,
  contarSuscripciones,
  avisarAdministracion,
  type DatosSuscripcion,
} from '@/lib/notificaciones/push'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'

/** Nombre legible del dispositivo, para distinguir el celular del portátil. */
function nombreDeDispositivo(agente: string | null): string {
  if (!agente) return 'Dispositivo'
  if (/iPhone|iPad/i.test(agente)) return 'iPhone o iPad'
  if (/Android/i.test(agente)) return 'Android'
  if (/Macintosh/i.test(agente)) return 'Mac'
  if (/Windows/i.test(agente)) return 'Windows'
  return 'Dispositivo'
}

export async function activarNotificaciones(
  suscripcion: DatosSuscripcion,
): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin()
  const cabeceras = await headers()

  try {
    await guardarSuscripcion(
      sesion.user.id,
      suscripcion,
      nombreDeDispositivo(cabeceras.get('user-agent')),
    )
    return { ok: true, mensaje: 'Este dispositivo recibirá los avisos de pedidos' }
  } catch (error) {
    console.error('[push] no se pudo guardar la suscripción', error)
    return { ok: false, error: 'No se pudo activar. Intenta de nuevo.' }
  }
}

export async function desactivarNotificaciones(
  endpoint: string,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  try {
    await borrarSuscripcion(endpoint)
    return { ok: true, mensaje: 'Este dispositivo dejó de recibir avisos' }
  } catch {
    return { ok: false, error: 'No se pudo desactivar' }
  }
}

export async function dispositivosActivos(): Promise<number> {
  const sesion = await requerirAdmin()
  return contarSuscripciones(sesion.user.id)
}

/** Manda un aviso de prueba a todos los dispositivos registrados. */
export async function probarNotificacion(): Promise<ResultadoAccion> {
  await requerirAdmin()

  const { enviados, fallidos } = await avisarAdministracion({
    titulo: 'Prueba de notificaciones 🦋',
    cuerpo: 'Si ves esto, los avisos de pedidos van a llegar bien.',
    etiqueta: 'prueba',
  })

  if (enviados === 0) {
    return {
      ok: false,
      error:
        fallidos > 0
          ? 'No se pudo entregar en ningún dispositivo'
          : 'Todavía no hay ningún dispositivo activado',
    }
  }

  return {
    ok: true,
    mensaje: `Aviso enviado a ${enviados} dispositivo${enviados === 1 ? '' : 's'}`,
  }
}
