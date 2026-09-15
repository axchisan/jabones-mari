'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
        if (!cuerpo?.limites) return

        const avisos = sincronizarLimites(cuerpo.limites)

        // Si algo se agotó, la página que hay detrás está mintiendo: se quedó
        // con el catálogo que se cargó al entrar y sigue mostrando existencias
        // que ya no hay. router.refresh() vacía la caché del enrutador y trae
        // el catálogo de nuevo, así el precio y el "Quedan N" cuadran con el
        // aviso del carrito.
        if (avisos.length > 0) {
          router.refresh()

          // Se olvida la última consulta: si la clienta vuelve a tocar el
          // botón en la página vieja, hay que volver a preguntar en vez de
          // dar por bueno lo que ya se consultó para esa misma lista.
          ultimaConsulta.current = ''
        }
      })
      .catch(() => {
        // Sin red no se recorta nada: el servidor lo comprobará igual al
        // confirmar, y dejar el carrito intacto es lo menos molesto.
        ultimaConsulta.current = ''
      })

    return () => cancelar.abort()
  }, [activo, hidratado, ids, sincronizarLimites, router])
}
