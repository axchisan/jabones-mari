'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { Marca } from '@/components/marca'
import { usarCarrito, unidadesDe } from '@/lib/carrito'
import { useSession } from '@/lib/auth/cliente'
import { cn } from '@/lib/utilidades'

const ENLACES = [
  { href: '/catalogo', texto: 'Catálogo' },
  { href: '/combos', texto: 'Combos' },
  { href: '/nosotros', texto: 'Nosotros' },
  { href: '/contacto', texto: 'Contacto' },
]

export function Encabezado() {
  const ruta = usePathname()
  const items = usarCarrito((e) => e.items)
  const hidratado = usarCarrito((e) => e.hidratado)
  const abrir = usarCarrito((e) => e.abrir)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { data: sesion } = useSession()

  const unidades = unidadesDe(items)

  useEffect(() => {
    setMenuAbierto(false)
  }, [ruta])

  if (ruta?.startsWith('/admin')) return null

  return (
    <>
      <p className="bg-tinta px-4 py-2 text-center text-[0.72rem] tracking-wide text-crema">
        Hecho a mano en Bogotá · Domicilios coordinados por WhatsApp
      </p>

      <header className="sticky top-0 z-20 border-b border-linea bg-crema/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Marca />

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {ENLACES.map((enlace) => {
                const activo = ruta === enlace.href || ruta?.startsWith(`${enlace.href}/`)
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      className={cn(
                        'text-sm transition-colors hover:text-rosa-hondo',
                        activo ? 'text-rosa-hondo' : 'text-tinta-media',
                      )}
                      aria-current={activo ? 'page' : undefined}
                    >
                      {enlace.texto}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href={sesion?.user ? '/mi-cuenta' : '/ingresar'}
              className="grid size-10 place-items-center rounded-full text-tinta-media transition hover:bg-crema-hondo hover:text-rosa-hondo"
              aria-label={sesion?.user ? 'Mi cuenta' : 'Ingresar a mi cuenta'}
              title={sesion?.user ? 'Mi cuenta' : 'Ingresar'}
            >
              <User className="size-[1.15rem]" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={abrir}
              className="relative flex items-center gap-2 rounded-full border border-linea-fuerte bg-white px-3.5 py-2 text-sm text-tinta transition hover:border-rosa hover:text-rosa-hondo"
              aria-label={
                unidades > 0
                  ? `Abrir carrito, ${unidades} producto${unidades === 1 ? '' : 's'}`
                  : 'Abrir carrito, vacío'
              }
            >
              <ShoppingBag className="size-[1.05rem]" aria-hidden="true" />
              <span
                className={cn(
                  'cifra grid size-5 place-items-center rounded-full text-[0.7rem] font-semibold transition',
                  hidratado && unidades > 0
                    ? 'bg-rosa text-white'
                    : 'bg-crema-hondo text-tinta-tenue',
                )}
              >
                {hidratado ? unidades : 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              className="grid size-10 place-items-center rounded-full text-tinta md:hidden"
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuAbierto ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav
            id="menu-movil"
            aria-label="Principal, móvil"
            className="border-t border-linea bg-crema md:hidden"
          >
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {ENLACES.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="block border-b border-linea py-3 text-[0.95rem] text-tinta last:border-b-0"
                  >
                    {enlace.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  )
}
