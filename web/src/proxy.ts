import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * Chequeo optimista: si no hay cookie de sesión, manda al login sin tocar
 * la base de datos. La verificación real del rol vive en cada página del
 * panel (requerirAdmin), que es lo que de verdad autoriza.
 */
export function proxy(peticion: NextRequest) {
  const cookie = getSessionCookie(peticion)

  if (!cookie) {
    const destino = peticion.nextUrl.pathname + peticion.nextUrl.search
    const login = new URL('/ingresar', peticion.url)
    login.searchParams.set('volver', destino)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mi-cuenta/:path*'],
}
