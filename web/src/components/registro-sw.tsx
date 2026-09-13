'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker solo en producción: en desarrollo estorba,
 * porque sirve versiones cacheadas mientras se está editando.
 */
export function RegistroServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const registrar = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[pwa] no se pudo registrar el service worker', error)
      })
    }

    if (document.readyState === 'complete') {
      registrar()
    } else {
      window.addEventListener('load', registrar, { once: true })
      return () => window.removeEventListener('load', registrar)
    }
  }, [])

  return null
}
