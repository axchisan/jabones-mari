/**
 * Service worker de Jabones Mari.
 *
 * Objetivo: que el catálogo se vea aunque la señal esté mala, sin servir
 * nunca precios viejos. Por eso las páginas van primero a la red y solo
 * caen al caché si la red falla; las imágenes, que no cambian, sí van
 * primero al caché.
 *
 * Al cambiar VERSION se descartan los cachés anteriores.
 */

const VERSION = 'v2'
const CACHE_PAGINAS = `paginas-${VERSION}`
const CACHE_ESTATICOS = `estaticos-${VERSION}`
const PAGINA_SIN_CONEXION = '/sin-conexion'

const NUESTROS_CACHES = [CACHE_PAGINAS, CACHE_ESTATICOS]

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_PAGINAS)
      .then((cache) => cache.addAll([PAGINA_SIN_CONEXION]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => !NUESTROS_CACHES.includes(clave))
            .map((clave) => caches.delete(clave)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function esEstatico(url) {
  return (
    url.pathname.startsWith('/productos/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:jpg|jpeg|png|webp|avif|svg|woff2)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request

  if (peticion.method !== 'GET') return

  const url = new URL(peticion.url)
  if (url.origin !== self.location.origin) return

  // Nunca cachear la API: los pedidos y el panel siempre van a la red.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return

  if (esEstatico(url)) {
    evento.respondWith(
      caches.match(peticion).then(
        (enCache) =>
          enCache ??
          fetch(peticion).then((respuesta) => {
            if (respuesta.ok) {
              const copia = respuesta.clone()
              caches.open(CACHE_ESTATICOS).then((cache) => cache.put(peticion, copia))
            }
            return respuesta
          }),
      ),
    )
    return
  }

  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone()
          caches.open(CACHE_PAGINAS).then((cache) => cache.put(peticion, copia))
          return respuesta
        })
        .catch(async () => {
          const enCache = await caches.match(peticion)
          return enCache ?? caches.match(PAGINA_SIN_CONEXION)
        }),
    )
  }
})

/* ------------------------------------------------------------ avisos push */

/**
 * Aviso de pedido nuevo. Llega aunque el panel esté cerrado, siempre que
 * esté instalado como aplicación y se hayan aceptado las notificaciones.
 */
self.addEventListener('push', (evento) => {
  if (!evento.data) return

  let datos
  try {
    datos = evento.data.json()
  } catch {
    datos = { titulo: 'Jabones Mari', cuerpo: evento.data.text() }
  }

  evento.waitUntil(
    self.registration.showNotification(datos.titulo ?? 'Jabones Mari', {
      body: datos.cuerpo ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      // Misma etiqueta agrupa los avisos en vez de apilar decenas.
      tag: datos.etiqueta ?? 'pedido',
      renotify: true,
      requireInteraction: false,
      data: { url: datos.url ?? '/admin/pedidos' },
    }),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const destino = evento.notification.data?.url ?? '/admin/pedidos'

  evento.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      // Si el panel ya está abierto, se reutiliza esa ventana.
      for (const ventana of ventanas) {
        if (ventana.url.includes('/admin') && 'focus' in ventana) {
          await ventana.focus()
          if ('navigate' in ventana) await ventana.navigate(destino)
          return
        }
      }

      await self.clients.openWindow(destino)
    })(),
  )
})
