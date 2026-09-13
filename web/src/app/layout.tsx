import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Karla } from 'next/font/google'
import './globals.css'
import { Encabezado } from '@/components/encabezado'
import { PieDePagina } from '@/components/pie-de-pagina'
import { CajonCarrito } from '@/components/cajon-carrito'
import { BotonWhatsappFlotante } from '@/components/boton-whatsapp'
import { RegistroServiceWorker } from '@/components/registro-sw'
import { NEGOCIO, SITIO_URL } from '@/lib/config'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--fuente-display',
  display: 'swap',
})

const texto = Karla({
  subsets: ['latin'],
  variable: '--fuente-texto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: {
    default: `${NEGOCIO.nombre} · Jabones artesanales naturales en Bogotá`,
    template: `%s · ${NEGOCIO.nombre}`,
  },
  description:
    'Jabones de glicerina artesanales, hechos a mano en Bogotá con ingredientes naturales. Pide por WhatsApp y coordinamos la entrega.',
  keywords: [
    'jabones artesanales bogotá',
    'jabón natural hecho a mano',
    'jabón de glicerina artesanal',
    'jabón natural piel sensible',
    'jabones artesanales domicilio bogotá',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: NEGOCIO.nombre,
    url: SITIO_URL,
    title: `${NEGOCIO.nombre} · Jabones artesanales naturales en Bogotá`,
    description:
      'Jabones de glicerina hechos a mano con ingredientes naturales, con domicilio en Bogotá.',
    images: [{ url: '/hero-familia.jpg', width: 1376, height: 768, alt: 'Jabones artesanales de Mari sobre mármol' }],
  },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#e07fae',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-tinta focus:px-5 focus:py-2 focus:text-sm focus:text-crema"
        >
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <PieDePagina />
        <CajonCarrito />
        <BotonWhatsappFlotante />
        <RegistroServiceWorker />
      </body>
    </html>
  )
}
