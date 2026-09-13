'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { clienteAuth } from '@/lib/auth/cliente'

export function BotonGoogle({ volver = '/mi-cuenta' }: { volver?: string }) {
  const [cargando, setCargando] = useState(false)

  async function entrar() {
    setCargando(true)
    try {
      await clienteAuth.signIn.social({ provider: 'google', callbackURL: volver })
    } catch {
      setCargando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={entrar}
      disabled={cargando}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-linea-fuerte bg-white px-6 py-3 font-semibold text-tinta transition hover:border-rosa hover:bg-rosa-niebla disabled:opacity-60"
    >
      {cargando ? (
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.87z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.07L5.84 9.9c.87-2.6 3.3-4.53 6.16-4.53"
          />
        </svg>
      )}
      Continuar con Google
    </button>
  )
}
