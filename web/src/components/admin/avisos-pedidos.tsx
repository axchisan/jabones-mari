'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2, Check, AlertCircle, Send, Mail } from 'lucide-react'
import {
  activarNotificaciones,
  desactivarNotificaciones,
  probarNotificacion,
  probarAvisoPorCorreo,
} from '@/lib/admin/acciones-notificaciones'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'
import { cn } from '@/lib/utilidades'

type Estado = 'cargando' | 'no-compatible' | 'bloqueado' | 'apagado' | 'encendido'

/** La clave pública VAPID viaja en base64url y el navegador la quiere en bytes. */
function aBytes(base64url: string): Uint8Array {
  const relleno = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + relleno).replace(/-/g, '+').replace(/_/g, '/')
  const crudo = atob(base64)
  return Uint8Array.from([...crudo].map((c) => c.charCodeAt(0)))
}

export function AvisosDePedidos({ correoActivo }: { correoActivo: boolean }) {
  const [estado, setEstado] = useState<Estado>('cargando')
  const [trabajando, setTrabajando] = useState(false)
  const [aviso, setAviso] = useState<ResultadoAccion | null>(null)

  const clavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    let cancelado = false

    async function revisar() {
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !clavePublica
      ) {
        if (!cancelado) setEstado('no-compatible')
        return
      }

      if (Notification.permission === 'denied') {
        if (!cancelado) setEstado('bloqueado')
        return
      }

      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcion = await registro.pushManager.getSubscription()
        if (!cancelado) setEstado(suscripcion ? 'encendido' : 'apagado')
      } catch {
        if (!cancelado) setEstado('no-compatible')
      }
    }

    revisar()
    return () => {
      cancelado = true
    }
  }, [clavePublica])

  async function encender() {
    setTrabajando(true)
    setAviso(null)

    try {
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') {
        setEstado(permiso === 'denied' ? 'bloqueado' : 'apagado')
        setTrabajando(false)
        return
      }

      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: aBytes(clavePublica!) as BufferSource,
      })

      const { endpoint, keys } = suscripcion.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      const resultado = await activarNotificaciones({ endpoint, keys })
      setAviso(resultado)
      if (resultado.ok) setEstado('encendido')
    } catch (error) {
      console.error('[push] no se pudo activar', error)
      setAviso({ ok: false, error: 'No se pudo activar en este dispositivo' })
    } finally {
      setTrabajando(false)
    }
  }

  async function apagar() {
    setTrabajando(true)
    setAviso(null)

    try {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.getSubscription()

      if (suscripcion) {
        await desactivarNotificaciones(suscripcion.endpoint)
        await suscripcion.unsubscribe()
      }

      setEstado('apagado')
      setAviso({ ok: true, mensaje: 'Este dispositivo dejó de recibir avisos' })
    } catch {
      setAviso({ ok: false, error: 'No se pudo desactivar' })
    } finally {
      setTrabajando(false)
    }
  }

  async function probar() {
    setTrabajando(true)
    setAviso(await probarNotificacion())
    setTrabajando(false)
  }

  async function probarCorreoAhora() {
    setTrabajando(true)
    setAviso(await probarAvisoPorCorreo())
    setTrabajando(false)
  }

  if (estado === 'cargando') return null

  return (
    <section
      className={cn(
        'rounded-tarjeta border p-5',
        estado === 'encendido' ? 'border-linea bg-white' : 'border-rosa bg-rosa-niebla',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-full',
              estado === 'encendido'
                ? 'bg-salvia-suave text-salvia'
                : 'bg-rosa-suave text-rosa-hondo',
            )}
          >
            {estado === 'encendido' ? (
              <Bell className="size-5" aria-hidden="true" />
            ) : (
              <BellOff className="size-5" aria-hidden="true" />
            )}
          </span>

          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Avisos de pedidos
            </h2>
            <p className="mt-0.5 max-w-lg text-sm text-tinta-media">
              {estado === 'encendido'
                ? 'Este dispositivo te avisa apenas entre un pedido, aunque tengas el panel cerrado.'
                : estado === 'bloqueado'
                  ? 'Las notificaciones están bloqueadas en este navegador. Actívalas desde los ajustes del sitio y vuelve a intentar.'
                  : estado === 'no-compatible'
                    ? 'Este navegador no admite avisos. Abre el panel desde Chrome en el celular, o instálalo como aplicación.'
                    : 'Actívalos y te llega una notificación al celular cuando alguien haga un pedido, aunque no envíe el mensaje de WhatsApp.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {estado === 'apagado' && (
            <button
              type="button"
              disabled={trabajando}
              onClick={encender}
              className="inline-flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
            >
              {trabajando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Activar avisos
            </button>
          )}

          {estado === 'encendido' && (
            <>
              <button
                type="button"
                disabled={trabajando}
                onClick={probar}
                className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2.5 text-sm transition hover:border-rosa hover:text-rosa-hondo disabled:opacity-60"
              >
                <Send className="size-3.5" aria-hidden="true" />
                Probar
              </button>
              <button
                type="button"
                disabled={trabajando}
                onClick={apagar}
                className="rounded-full px-3 py-2.5 text-sm text-tinta-tenue transition hover:text-rosa-hondo disabled:opacity-60"
              >
                Desactivar
              </button>
            </>
          )}
        </div>
      </div>

      {aviso && (
        <p
          role="status"
          className={cn(
            'mt-4 flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
            aviso.ok ? 'bg-salvia-suave text-salvia' : 'bg-rosa-suave text-rosa-hondo',
          )}
        >
          {aviso.ok ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          {aviso.ok ? aviso.mensaje : aviso.error}
        </p>
      )}

      {estado === 'apagado' && (
        <p className="mt-3 text-xs text-tinta-tenue">
          Hay que activarlos en cada dispositivo donde quieras recibirlos. En el celular,
          instala antes el panel como aplicación desde el menú del navegador.
        </p>
      )}

      {/* Respaldo por correo: llega aunque el celular esté apagado. */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-linea pt-4">
        <p className="flex items-center gap-2 text-sm text-tinta-media">
          <Mail className="size-4 shrink-0 text-tinta-tenue" aria-hidden="true" />
          {correoActivo
            ? 'También te llega un correo con cada pedido.'
            : 'El aviso por correo no está configurado. Ver docs/13-avisos.md'}
        </p>

        {correoActivo && (
          <button
            type="button"
            disabled={trabajando}
            onClick={probarCorreoAhora}
            className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm transition hover:border-rosa hover:text-rosa-hondo disabled:opacity-60"
          >
            <Send className="size-3.5" aria-hidden="true" />
            Probar correo
          </button>
        )}
      </div>
    </section>
  )
}
