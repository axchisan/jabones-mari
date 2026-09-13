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

export function fechaLegible(valor: Date | string): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(fecha)
}
