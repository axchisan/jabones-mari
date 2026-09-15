import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db, esquema } from '@/lib/db/cliente'

/**
 * Cómo entra cada persona: con contraseña, con Google, o con las dos.
 *
 * Importa porque no se le puede ofrecer "cambiar contraseña" a quien entró
 * con Google y nunca tuvo una, ni dejarla sin forma de entrar.
 */
export type FormasDeEntrar = {
  conContrasena: boolean
  conGoogle: boolean
}

export async function formasDeEntrar(usuarioId: string): Promise<FormasDeEntrar> {
  if (!db) return { conContrasena: false, conGoogle: false }

  const cuentas = await db
    .select({
      providerId: esquema.cuentas.providerId,
      password: esquema.cuentas.password,
    })
    .from(esquema.cuentas)
    .where(eq(esquema.cuentas.userId, usuarioId))

  return {
    conContrasena: cuentas.some((c) => c.providerId === 'credential' && Boolean(c.password)),
    conGoogle: cuentas.some((c) => c.providerId === 'google'),
  }
}

/** ¿Este correo ya existe con contraseña? Sirve para avisar antes de registrar. */
export async function existeConContrasena(correo: string): Promise<boolean> {
  if (!db) return false

  const [usuario] = await db
    .select({ id: esquema.usuarios.id })
    .from(esquema.usuarios)
    .where(eq(esquema.usuarios.email, correo.trim().toLowerCase()))
    .limit(1)

  if (!usuario) return false

  const [cuenta] = await db
    .select({ id: esquema.cuentas.id })
    .from(esquema.cuentas)
    .where(
      and(
        eq(esquema.cuentas.userId, usuario.id),
        eq(esquema.cuentas.providerId, 'credential'),
      ),
    )
    .limit(1)

  return Boolean(cuenta)
}
