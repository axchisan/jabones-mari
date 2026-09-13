'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/lib/auth/servidor'
import { requerirAdmin } from '@/lib/auth/sesion'
import { db, esquema } from '@/lib/db/cliente'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'

/**
 * Gestión del equipo. Cualquier admin puede sumar a otro, pero nadie puede
 * quitarse a sí mismo el acceso ni dejar el negocio sin ningún administrador.
 */

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL')
  return db
}

export type Miembro = {
  id: string
  nombre: string
  correo: string
  rol: string
  creadoEn: Date
  tienePedidos: boolean
}

export async function listarUsuarios(): Promise<Miembro[]> {
  await requerirAdmin()
  const conexion = baseDeDatos()

  const [filas, pedidos] = await Promise.all([
    conexion
      .select({
        id: esquema.usuarios.id,
        nombre: esquema.usuarios.name,
        correo: esquema.usuarios.email,
        rol: esquema.usuarios.role,
        creadoEn: esquema.usuarios.createdAt,
      })
      .from(esquema.usuarios)
      .orderBy(asc(esquema.usuarios.createdAt)),
    conexion.select({ usuarioId: esquema.pedidos.usuarioId }).from(esquema.pedidos),
  ])

  const conPedidos = new Set(pedidos.map((p) => p.usuarioId).filter(Boolean))

  return filas.map((fila) => ({ ...fila, tienePedidos: conPedidos.has(fila.id) }))
}

async function contarAdmins(): Promise<number> {
  const filas = await baseDeDatos()
    .select({ id: esquema.usuarios.id })
    .from(esquema.usuarios)
    .where(eq(esquema.usuarios.role, 'admin'))
  return filas.length
}

const esquemaNuevoAdmin = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre').max(80),
  email: z.string().trim().toLowerCase().email('Escribe un correo válido'),
  password: z
    .string()
    .min(8, 'La contraseña necesita al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga'),
})

export async function crearAdmin(
  _previo: ResultadoAccion | null,
  datos: FormData,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  const analisis = esquemaNuevoAdmin.safeParse({
    name: datos.get('name'),
    email: datos.get('email'),
    password: datos.get('password'),
  })

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' }
  }

  const valores = analisis.data
  const conexion = baseDeDatos()

  const [existente] = await conexion
    .select({ id: esquema.usuarios.id, rol: esquema.usuarios.role })
    .from(esquema.usuarios)
    .where(eq(esquema.usuarios.email, valores.email))
    .limit(1)

  // Si ya tiene cuenta de clienta, se asciende en vez de duplicarla.
  if (existente) {
    if (existente.rol === 'admin') {
      return { ok: false, error: 'Esa persona ya es administradora' }
    }

    await conexion
      .update(esquema.usuarios)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(esquema.usuarios.id, existente.id))

    revalidatePath('/admin/equipo')
    return {
      ok: true,
      mensaje: `${valores.email} ya tenía cuenta: ahora es administradora y entra con su contraseña de siempre`,
    }
  }

  try {
    await auth.api.createUser({
      body: {
        name: valores.name,
        email: valores.email,
        password: valores.password,
        role: 'admin',
      },
      headers: await headers(),
    })

    revalidatePath('/admin/equipo')
    return { ok: true, mensaje: `${valores.email} ya puede entrar al panel` }
  } catch (error) {
    console.error('[admin] no se pudo crear el administrador', error)
    return { ok: false, error: 'No se pudo crear la cuenta. Intenta de nuevo.' }
  }
}

export async function cambiarRol(
  usuarioId: string,
  rol: 'admin' | 'cliente',
): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin()

  if (usuarioId === sesion.user.id) {
    return { ok: false, error: 'No puedes cambiarte el rol a ti misma' }
  }

  if (rol === 'cliente' && (await contarAdmins()) <= 1) {
    return { ok: false, error: 'Debe quedar al menos una persona administradora' }
  }

  const [fila] = await baseDeDatos()
    .update(esquema.usuarios)
    .set({ role: rol, updatedAt: new Date() })
    .where(eq(esquema.usuarios.id, usuarioId))
    .returning({ correo: esquema.usuarios.email })

  if (!fila) return { ok: false, error: 'No encontramos esa persona' }

  revalidatePath('/admin/equipo')
  return {
    ok: true,
    mensaje:
      rol === 'admin'
        ? `${fila.correo} ahora entra al panel`
        : `${fila.correo} ya no tiene acceso al panel`,
  }
}

export async function eliminarUsuario(usuarioId: string): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin()

  if (usuarioId === sesion.user.id) {
    return { ok: false, error: 'No puedes eliminar tu propia cuenta' }
  }

  const conexion = baseDeDatos()

  const [objetivo] = await conexion
    .select({ correo: esquema.usuarios.email, rol: esquema.usuarios.role })
    .from(esquema.usuarios)
    .where(eq(esquema.usuarios.id, usuarioId))
    .limit(1)

  if (!objetivo) return { ok: false, error: 'No encontramos esa persona' }

  if (objetivo.rol === 'admin' && (await contarAdmins()) <= 1) {
    return { ok: false, error: 'Debe quedar al menos una persona administradora' }
  }

  // Los pedidos no se borran: quedan como pedidos sin cuenta (usuario_id = null).
  await conexion.delete(esquema.usuarios).where(eq(esquema.usuarios.id, usuarioId))

  revalidatePath('/admin/equipo')
  return { ok: true, mensaje: `La cuenta de ${objetivo.correo} fue eliminada` }
}
