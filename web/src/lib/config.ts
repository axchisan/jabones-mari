/** Datos del negocio. Al conectar la base de datos, los editables pasan a la tabla `ajustes`. */

const numeroCrudo = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573212881565'

export const NEGOCIO = {
  nombre: 'Jabones Mari',
  nombreCorto: 'Mari',
  tagline: 'Limpieza con el alma',
  descripcion:
    'Jabones artesanales de glicerina, hechos a mano en Bogotá con ingredientes naturales.',
  ciudad: 'Bogotá',
  pais: 'Colombia',
  whatsapp: numeroCrudo,
  instagram: null as string | null,
  correo: null as string | null,
} as const

export const SITIO_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jabonesmari.shop'

/** Costo del domicilio en pesos. La política de envíos aún está en definición. */
export const DOMICILIO = {
  definido: false,
  costo: 0,
  texto: 'Coordinamos la entrega y el costo del domicilio contigo por WhatsApp.',
} as const

export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}
