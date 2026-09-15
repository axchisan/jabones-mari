import 'server-only'
import { randomUUID, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'

/**
 * Lista de correos con consentimiento para promociones.
 *
 * La Ley 1581 de 2012 pide dos cosas que aquí se cumplen: poder demostrar
 * cuándo se dio el consentimiento, y poder retirarlo con la misma facilidad
 * con que se dio. Por eso nunca se borra la fila al darse de baja — se marca
 * como revocada, con su fecha.
 */

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL')
  return db
}

function nuevoToken(): string {
  return randomBytes(24).toString('base64url')
}

/**
 * Registra el consentimiento de un correo. Si ya existía y había revocado,
 * se reactiva; el consentimiento nuevo pisa al anterior.
 */
export async function registrarConsentimiento(
  correo: string,
  nombre: string | null,
  origen: 'pedido' | 'cuenta' = 'pedido',
): Promise<string> {
  const conexion = baseDeDatos()
  const normalizado = correo.trim().toLowerCase()
  const token = nuevoToken()
  const ahora = new Date()

  const [fila] = await conexion
    .insert(esquema.suscriptoresCorreo)
    .values({
      id: randomUUID(),
      correo: normalizado,
      nombre,
      acepta: true,
      origen,
      tokenBaja: token,
      aceptadoEn: ahora,
      actualizadoEn: ahora,
    })
    .onConflictDoUpdate({
      target: esquema.suscriptoresCorreo.correo,
      set: {
        acepta: true,
        nombre,
        aceptadoEn: ahora,
        revocadoEn: null,
        actualizadoEn: ahora,
      },
    })
    .returning({ tokenBaja: esquema.suscriptoresCorreo.tokenBaja })

  return fila.tokenBaja
}

/** Da de baja por el token del enlace. Devuelve el correo si lo encontró. */
export async function revocarPorToken(token: string): Promise<string | null> {
  const [fila] = await baseDeDatos()
    .update(esquema.suscriptoresCorreo)
    .set({ acepta: false, revocadoEn: new Date(), actualizadoEn: new Date() })
    .where(eq(esquema.suscriptoresCorreo.tokenBaja, token))
    .returning({ correo: esquema.suscriptoresCorreo.correo })

  return fila?.correo ?? null
}

export async function tokenDe(correo: string): Promise<string | null> {
  const [fila] = await baseDeDatos()
    .select({ tokenBaja: esquema.suscriptoresCorreo.tokenBaja })
    .from(esquema.suscriptoresCorreo)
    .where(eq(esquema.suscriptoresCorreo.correo, correo.trim().toLowerCase()))
    .limit(1)

  return fila?.tokenBaja ?? null
}

export type Suscriptor = {
  correo: string
  nombre: string | null
  acepta: boolean
  origen: string
  aceptadoEn: Date
  revocadoEn: Date | null
}

/** Para el panel: quién aceptó recibir promociones y quién se dio de baja. */
export async function listarSuscriptores(): Promise<Suscriptor[]> {
  const filas = await baseDeDatos()
    .select({
      correo: esquema.suscriptoresCorreo.correo,
      nombre: esquema.suscriptoresCorreo.nombre,
      acepta: esquema.suscriptoresCorreo.acepta,
      origen: esquema.suscriptoresCorreo.origen,
      aceptadoEn: esquema.suscriptoresCorreo.aceptadoEn,
      revocadoEn: esquema.suscriptoresCorreo.revocadoEn,
    })
    .from(esquema.suscriptoresCorreo)
    .orderBy(esquema.suscriptoresCorreo.aceptadoEn)

  return filas
}
