'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, Loader2, Check, UserCheck } from 'lucide-react'
import { usarCarrito, subtotalDe } from '@/lib/carrito'
import { useSincronizarStock } from '@/lib/sincronizar-carrito'
import { AvisoExistencias } from '@/components/aviso-existencias'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO } from '@/lib/tipos'
import { datosClienteSchema, type DatosCliente } from '@/lib/validacion'
import { DOMICILIO, enlaceWhatsApp } from '@/lib/config'
import { cn } from '@/lib/utilidades'

type Enviado = { codigo: string; enlace: string }

type DatosIniciales = {
  clienteNombre: string
  correo: string
  telefono: string
  direccion: string
  barrio: string
}

export function FormularioPedido({ inicial }: { inicial?: DatosIniciales }) {
  const items = usarCarrito((e) => e.items)
  const hidratado = usarCarrito((e) => e.hidratado)
  const vaciar = usarCarrito((e) => e.vaciar)
  const ajustes = usarCarrito((e) => e.ajustes)
  const olvidarAjustes = usarCarrito((e) => e.olvidarAjustes)
  const sincronizarLimites = usarCarrito((e) => e.sincronizarLimites)
  const [enviado, setEnviado] = useState<Enviado | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  // Antes de pedir los datos se comprueba que todavía haya existencias: es
  // preferible avisarlo aquí que después de que la clienta llene el formulario.
  useSincronizarStock(!enviado)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosCliente>({
    resolver: zodResolver(datosClienteSchema),
    mode: 'onBlur',
    defaultValues: inicial,
  })

  // La casilla de novedades solo aparece si hay a dónde escribir.
  // useWatch en vez de watch: el otro devuelve funciones que el compilador
  // de React no puede memoizar, y desactiva la optimización del formulario.
  const correo = useWatch({ control, name: 'correo' })

  const subtotal = subtotalDe(items)

  async function alEnviar(datos: DatosCliente) {
    setErrorGeneral(null)
    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datos,
          items: items.map((i) => ({
            varianteId: i.varianteId,
            productoSlug: i.productoSlug,
            nombre: i.nombre,
            tamano: i.tamano,
            precio: i.precio,
            cantidad: i.cantidad,
          })),
        }),
      })

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null)
        setErrorGeneral(cuerpo?.error ?? 'No pudimos registrar el pedido. Intenta de nuevo.')

        // Si fue por existencias, se refrescan los topes para que el resumen
        // de arriba muestre lo que sí se puede llevar.
        if (respuesta.status === 409) {
          const ids = items.map((i) => i.varianteId).join(',')
          const nuevos = await fetch(`/api/disponibilidad?ids=${encodeURIComponent(ids)}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
          if (nuevos?.limites) sincronizarLimites(nuevos.limites)
        }
        return
      }

      const { codigo, mensaje } = (await respuesta.json()) as {
        codigo: string
        mensaje: string
      }
      const enlace = enlaceWhatsApp(mensaje)

      setEnviado({ codigo, enlace })
      vaciar()

      // En móvil los bloqueadores matan window.open: se navega en la misma pestaña.
      window.location.assign(enlace)
    } catch {
      setErrorGeneral('Revisa tu conexión e intenta de nuevo.')
    }
  }

  /* ------------------------------------------------------- pedido enviado */
  if (enviado) {
    return (
      <div className="rounded-tarjeta border border-linea bg-white p-8 text-center shadow-tarjeta">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-whatsapp-suave text-whatsapp">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-3xl">Tu pedido quedó registrado</h1>
        <p className="cifra mt-1 text-lg text-rosa-hondo">{enviado.codigo}</p>
        <p className="mx-auto mt-3 max-w-md text-tinta-media">
          Te estamos llevando a WhatsApp para confirmarlo. Si no se abrió solo,
          toca el botón:
        </p>
        <a
          href={enviado.enlace}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-7 py-3.5 font-semibold text-white transition hover:brightness-110"
        >
          Abrir WhatsApp
        </a>
        <p className="mt-5 text-sm text-tinta-tenue">
          Guardamos tu pedido con ese código. Si algo cambia, lo ajustamos por el chat.
        </p>
        <Link
          href="/catalogo"
          className="mt-4 inline-block text-sm text-tinta-media underline-offset-4 hover:text-rosa-hondo hover:underline"
        >
          Volver al catálogo
        </Link>
      </div>
    )
  }

  /* -------------------------------------------------------- carrito vacío */
  if (hidratado && items.length === 0) {
    return (
      <>
        <AvisoExistencias avisos={ajustes} alCerrar={olvidarAjustes} className="mb-5" />

        <div className="rounded-tarjeta border border-dashed border-linea-fuerte bg-white p-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
            <ShoppingBag className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl">Tu carrito está vacío</h1>
          <p className="mt-2 text-tinta-media">
            Agrega algún jabón y vuelve para confirmar el pedido.
          </p>
          <Link
            href="/catalogo"
            className="mt-5 inline-block rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
          >
            Ver el catálogo
          </Link>
        </div>
      </>
    )
  }

  /* ------------------------------------------------------------ checkout */
  return (
    <>
      <header className="flex flex-col gap-2">
        <span className="versalita text-rosa-hondo">Último paso</span>
        <h1 className="text-[clamp(2rem,5vw,2.8rem)] leading-tight">
          Confirma tu pedido
        </h1>
        <p className="max-w-xl text-tinta-media">
          Déjanos tus datos y te llevamos al chat de WhatsApp con el pedido ya
          escrito. Ahí terminamos de coordinar la entrega contigo.
        </p>
      </header>

      {/* Resumen */}
      <section className="mt-7 rounded-tarjeta border border-linea bg-white p-5 shadow-tarjeta">
        <h2 className="versalita mb-3 font-[family-name:var(--font-sans)] text-tinta-tenue">
          Tu pedido
        </h2>
        <ul className="divide-y divide-linea">
          {items.map((item) => (
            <li key={item.varianteId} className="flex items-center gap-3 py-3">
              <Image
                src={item.imagen}
                alt=""
                width={52}
                height={52}
                className="size-13 rounded-suave bg-crema object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-display)] text-[1.05rem]">
                  {item.nombre}
                </p>
                <p className="versalita text-tinta-tenue">
                  {ETIQUETA_TAMANO[item.tamano]} · {item.cantidad} und
                </p>
              </div>
              <span className="cifra font-semibold">
                {precio(item.precio * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-linea pt-3">
          <span className="text-tinta-media">Subtotal</span>
          <span className="cifra text-xl font-semibold">{precio(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-tinta-tenue">{DOMICILIO.texto}</p>
      </section>

      <AvisoExistencias avisos={ajustes} alCerrar={olvidarAjustes} className="mt-6" />

      {inicial && (
        <p className="mt-6 flex items-center gap-2 rounded-suave bg-salvia-suave px-4 py-3 text-sm text-salvia">
          <UserCheck className="size-4 shrink-0" aria-hidden="true" />
          Llenamos tus datos con los de tu cuenta. Cámbialos aquí si este pedido va a otra
          dirección.
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(alEnviar)} noValidate className="mt-6 flex flex-col gap-4">
        <Campo
          id="clienteNombre"
          etiqueta="Tu nombre"
          error={errors.clienteNombre?.message}
          requerido
        >
          <input
            id="clienteNombre"
            type="text"
            autoComplete="name"
            placeholder="María José Gómez"
            {...register('clienteNombre')}
            className={entrada(errors.clienteNombre)}
          />
        </Campo>

        <Campo
          id="telefono"
          etiqueta="Celular de contacto"
          ayuda="A este número te escribimos por WhatsApp."
          error={errors.telefono?.message}
          requerido
        >
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="321 288 1565"
            {...register('telefono')}
            className={cn(entrada(errors.telefono), 'cifra')}
          />
        </Campo>

        <Campo
          id="correo"
          etiqueta="Correo"
          ayuda="Opcional. Te mandamos la confirmación de tu pedido."
          error={errors.correo?.message}
        >
          <input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            {...register('correo')}
            className={entrada(errors.correo)}
          />
        </Campo>

        <Campo
          id="direccion"
          etiqueta="Dirección de entrega"
          ayuda="Opcional. Si prefieres, la acordamos por el chat."
          error={errors.direccion?.message}
        >
          <input
            id="direccion"
            type="text"
            autoComplete="street-address"
            placeholder="Calle 134 #58-20, apto 302"
            {...register('direccion')}
            className={entrada(errors.direccion)}
          />
        </Campo>

        <Campo id="barrio" etiqueta="Barrio o localidad" error={errors.barrio?.message}>
          <input
            id="barrio"
            type="text"
            placeholder="Cedritos, Usaquén"
            {...register('barrio')}
            className={entrada(errors.barrio)}
          />
        </Campo>

        <Campo
          id="notas"
          etiqueta="Notas para nosotras"
          ayuda="Horario preferido, si es para regalo, algún molde en especial…"
          error={errors.notas?.message}
        >
          <textarea
            id="notas"
            rows={3}
            placeholder="Prefiero entrega el sábado en la tarde"
            {...register('notas')}
            className={cn(entrada(errors.notas), 'resize-y')}
          />
        </Campo>

        {correo && (
          <label className="flex items-start gap-3 rounded-suave border border-linea bg-white px-4 py-3">
            <input
              type="checkbox"
              {...register('aceptaPromociones')}
              className="mt-0.5 size-4 shrink-0 accent-[#e07fae]"
            />
            <span className="text-sm">
              <span className="block font-semibold">Quiero recibir novedades</span>
              <span className="block text-tinta-media">
                Recetas nuevas y detalles de temporada, muy de vez en cuando. Te puedes dar
                de baja en cualquier momento.
              </span>
            </span>
          </label>
        )}

        {errorGeneral && (
          <p role="alert" className="rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo">
            {errorGeneral}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="flex items-center justify-center gap-2 rounded-full bg-whatsapp px-7 py-4 text-[1.05rem] font-semibold text-white shadow-tarjeta transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Registrando tu pedido…
            </>
          ) : (
            <>Confirmar y abrir WhatsApp</>
          )}
        </button>

        <p className="text-center text-xs text-tinta-tenue">
          No pedimos datos de pago. El pedido se confirma contigo por WhatsApp.
          <br />
          Al continuar aceptas nuestros{' '}
          <Link href="/terminos" className="underline hover:text-rosa-hondo">
            términos
          </Link>{' '}
          y la{' '}
          <Link href="/privacidad" className="underline hover:text-rosa-hondo">
            política de privacidad
          </Link>
          .
        </p>
      </form>
    </>
  )
}

function entrada(error?: { message?: string }) {
  return cn(
    'w-full rounded-suave border bg-white px-4 py-3 text-[1rem] outline-none transition placeholder:text-tinta-tenue/70',
    error ? 'border-rosa-hondo' : 'border-linea-fuerte focus:border-rosa',
  )
}

function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  requerido,
  children,
}: {
  id: string
  etiqueta: string
  ayuda?: string
  error?: string
  requerido?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
        {requerido && <span className="ml-1 text-rosa-hondo">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-rosa-hondo">
          {error}
        </p>
      ) : ayuda ? (
        <p className="text-xs text-tinta-tenue">{ayuda}</p>
      ) : null}
    </div>
  )
}
