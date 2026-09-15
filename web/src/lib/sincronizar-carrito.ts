'use client'

import { useEffect, useRef } from 'react'
import { usarCarrito } from '@/lib/carrito'

/**
 * Pone al día los topes del carrito con el inventario real.
 *
 * El carrito se guarda en el navegador y puede llevar días ahí. Si mientras
 * tanto se acabó un jabón, es mejor que la clienta lo vea al abrir el carrito
 * y no después de llenar todos sus datos.
 *
 * `activo` evita pedirlo cuando el carrito está cerrado.
 */
export function useSincronizarStock(activo = true) {
  const items = usarCarrito((e) => e.items)
  const hidratado = usarCarrito((e) => e.hidratado)
  const sincronizarLimites = usarCarrito((e) => e.sincronizarLimites)

  const ids = items.map((i) => i.varianteId).sort().join(',')
  const ultimaConsulta = useRef<string>('')

  useEffect(() => {
    if (!activo || !hidratado || ids === '') return
    if (ultimaConsulta.current === ids) return

    ultimaConsulta.current = ids
    const cancelar = new AbortController()

    fetch(`/api/disponibilidad?ids=${encodeURIComponent(ids)}`, {
      signal: cancelar.signal,
    })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
      .then((cuerpo) => {
        if (cuerpo?.limites) sincronizarLimites(cuerpo.limites)
      })
      .catch(() => {
        // Sin red no se recorta nada: el servidor lo comprobará igual al
        // confirmar, y dejar el carrito intacto es lo menos molesto.
        ultimaConsulta.current = ''
      })

    return () => cancelar.abort()
  }, [activo, hidratado, ids, sincronizarLimites])
}
