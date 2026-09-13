import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/servidor'

/** La sesión actual, o null si nadie ha entrado. */
export async function obtenerSesion() {
  return auth.api.getSession({ headers: await headers() })
}

export async function obtenerUsuario() {
  const sesion = await obtenerSesion()
  return sesion?.user ?? null
}

export function esAdmin(usuario: { role?: string | null } | null | undefined): boolean {
  return usuario?.role === 'admin'
}

/**
 * Exige sesión de administrador. Si no la hay, manda al login guardando
 * a dónde quería entrar para volver ahí después.
 */
export async function requerirAdmin(destino = '/admin') {
  const sesion = await obtenerSesion()

  if (!sesion?.user) {
    redirect(`/ingresar?volver=${encodeURIComponent(destino)}`)
  }
  if (!esAdmin(sesion.user)) {
    redirect('/mi-cuenta?sinPermiso=1')
  }

  return sesion
}

/** Exige sesión de cualquier tipo (cliente o admin). */
export async function requerirSesion(destino = '/mi-cuenta') {
  const sesion = await obtenerSesion()
  if (!sesion?.user) {
    redirect(`/ingresar?volver=${encodeURIComponent(destino)}`)
  }
  return sesion
}
