import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Karla } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
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
    images: [
      {
        url: '/hero-familia.jpg',
        width: 1376,
        height: 768,
        alt: 'Jabones artesanales de Mari sobre mármol',
      },
    ],
  },
  alternates: { canonical: '/' },

  // Verificación de propiedad del dominio ante Google. Hace falta para
  // Search Console y para que Google acepte este dominio en la pantalla de
  // consentimiento del ingreso con Google.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: '#e07fae',
}

/**
 * Layout raíz: solo el documento y las fuentes.
 *
 * La tienda y el panel son dos aplicaciones distintas con su propia
 * envoltura — ver (tienda)/layout.tsx y admin/layout.tsx. Así el panel
 * nunca carga el encabezado, el carrito ni el botón de WhatsApp.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <RegistroServiceWorker />
        {/* Visitas y páginas más vistas, sin cookies ni datos personales:
            por eso la tienda no necesita banner de consentimiento. */}
        <Analytics />
      </body>
    </html>
  )
}
