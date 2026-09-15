const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** 7500 → "$7.500" */
export function precio(valor: number): string {
  return formateadorCOP.format(valor).replace(/\s/g, '')
}

/** 7500 → "7.500" (sin símbolo, para cuando el $ ya está en el diseño) */
export function numero(valor: number): string {
  return new Intl.NumberFormat('es-CO').format(valor)
}

/** "3212881565" → "321 288 1565" */
export function telefonoLegible(valor: string): string {
  const limpio = valor.replace(/\D/g, '').slice(-10)
  if (limpio.length !== 10) return valor
  return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`
}

/**
 * El negocio está en Bogotá y el servidor corre en UTC. Sin fijar la zona,
 * un pedido de las 00:43 se muestra como las 05:43, que fue justo lo que
 * pasó en los primeros correos.
 */
export const ZONA = 'America/Bogota'

/** "15 sept, 12:43 a. m." */
export function fechaLegible(valor: Date | string): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: ZONA,
  }).format(fecha)
}

/** "lunes, 15 de septiembre de 2026" — para reportes y encabezados. */
export function fechaCompleta(valor: Date | string): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA,
  }).format(fecha)
}

/** "15/09/2026" — compacta, para tablas y exportaciones. */
export function fechaCorta(valor: Date | string): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: ZONA,
  }).format(fecha)
}

/** El día en Bogotá como "2026-09-15", para agrupar ventas por fecha. */
export function diaEnBogota(valor: Date | string): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor
  const partes = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: ZONA,
  }).format(fecha)
  return partes
}
