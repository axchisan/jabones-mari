import Link from 'next/link'
import { Marca } from '@/components/marca'
import { NEGOCIO, enlaceWhatsApp } from '@/lib/config'
import { telefonoLegible } from '@/lib/formato'

const SECCIONES = [
  {
    titulo: 'Tienda',
    enlaces: [
      { href: '/catalogo', texto: 'Todos los jabones' },
      { href: '/combos', texto: 'Combos y regalos' },
      { href: '/catalogo?piel=Sensible', texto: 'Para piel sensible' },
    ],
  },
  {
    titulo: 'El emprendimiento',
    enlaces: [
      { href: '/nosotros', texto: 'Nuestra historia' },
      { href: '/contacto', texto: 'Contacto y pedidos' },
      { href: '/terminos', texto: 'Términos y condiciones' },
      { href: '/privacidad', texto: 'Política de privacidad' },
    ],
  },
]

export function PieDePagina() {
  return (
    <footer className="mt-20 border-t border-linea bg-crema-hondo">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start gap-3">
          <Marca />
          <p className="max-w-xs text-sm text-tinta-media">
            {NEGOCIO.descripcion}
          </p>
        </div>

        {SECCIONES.map((seccion) => (
          <nav key={seccion.titulo} aria-label={seccion.titulo}>
            <h2 className="versalita mb-3 font-[family-name:var(--font-sans)] text-tinta-tenue">
              {seccion.titulo}
            </h2>
            <ul className="flex flex-col gap-2">
              {seccion.enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="text-sm text-tinta-media transition-colors hover:text-rosa-hondo"
                  >
                    {enlace.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="versalita mb-3 font-[family-name:var(--font-sans)] text-tinta-tenue">
            Escríbenos
          </h2>
          <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="cifra inline-flex items-center gap-2 rounded-full bg-whatsapp-suave px-4 py-2 text-sm font-semibold text-whatsapp transition hover:brightness-97"
          >
            {telefonoLegible(NEGOCIO.whatsapp)}
          </a>
          <p className="mt-3 text-sm text-tinta-media">
            {NEGOCIO.ciudad}, {NEGOCIO.pais}
          </p>
        </div>
      </div>

      <div className="border-t border-linea">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-tinta-tenue sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.tagline}
          </p>
          <p>
            Producto cosmético artesanal. No sustituye tratamientos médicos.
          </p>
        </div>
      </div>
    </footer>
  )
}
