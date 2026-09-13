import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sin conexión',
  robots: { index: false, follow: false },
}

export default function SinConexion() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
        <WifiOff className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-3xl">Te quedaste sin señal</h1>
      <p className="text-tinta-media">
        No pudimos cargar esta página. Los jabones que ya viste siguen
        disponibles, y tu carrito está guardado.
      </p>
      <Link
        href="/catalogo"
        className="mt-2 rounded-full bg-rosa px-7 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
      >
        Volver al catálogo
      </Link>
    </div>
  )
}
