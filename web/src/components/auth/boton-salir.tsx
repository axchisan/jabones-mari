'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { clienteAuth } from '@/lib/auth/cliente'

export function BotonSalir({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    await clienteAuth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="inline-flex items-center gap-2 rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm text-tinta-media transition hover:border-rosa hover:text-rosa-hondo disabled:opacity-60"
    >
      {saliendo ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
      {compacto ? 'Salir' : 'Cerrar sesión'}
    </button>
  )
}
