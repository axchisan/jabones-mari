'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ClipboardList, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utilidades'

const SECCIONES = [
  { href: '/admin', texto: 'Resumen', icono: LayoutDashboard, exacta: true },
  { href: '/admin/productos', texto: 'Catálogo', icono: Package, exacta: false },
  { href: '/admin/pedidos', texto: 'Pedidos', icono: ClipboardList, exacta: false },
  { href: '/admin/ventas', texto: 'Ventas', icono: TrendingUp, exacta: false },
  { href: '/admin/equipo', texto: 'Equipo', icono: Users, exacta: false },
]

export function NavegacionAdmin() {
  const ruta = usePathname()

  return (
    <nav aria-label="Secciones del panel" className="border-t border-linea bg-crema">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-1.5">
        {SECCIONES.map(({ href, texto, icono: Icono, exacta }) => {
          const activa = exacta ? ruta === href : ruta.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activa ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition',
                  activa
                    ? 'bg-rosa text-white'
                    : 'text-tinta-media hover:bg-rosa-niebla hover:text-rosa-hondo',
                )}
              >
                <Icono className="size-4" aria-hidden="true" />
                {texto}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
