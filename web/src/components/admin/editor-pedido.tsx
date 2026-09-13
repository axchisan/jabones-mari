'use client'

import Link from 'next/link'
import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Check,
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
} from 'lucide-react'
import {
  cambiarEstado,
  cambiarCantidad,
  agregarItem,
  guardarDatosPedido,
  eliminarPedido,
} from '@/lib/admin/acciones-pedidos'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'
import { precio, telefonoLegible } from '@/lib/formato'
import { enlaceACliente } from '@/lib/whatsapp'
import {
  ESTADOS_PEDIDO,
  ETIQUETA_ESTADO,
  ETIQUETA_TAMANO,
  type EstadoPedido,
  type Pedido,
} from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

type Opcion = {
  varianteId: string
  etiqueta: string
  precio: number
  disponible: boolean
}

export function EditorPedido({
  pedido,
  opciones,
}: {
  pedido: Pedido
  opciones: Opcion[]
}) {
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [aviso, setAviso] = useState<ResultadoAccion | null>(null)

  function ejecutar(accion: () => Promise<ResultadoAccion>) {
    iniciar(async () => {
      const resultado = await accion()
      setAviso(resultado)
      router.refresh()
    })
  }

  const mensajeParaCliente = `¡Hola ${pedido.clienteNombre.split(' ')[0]}! Te escribimos de Jabones Mari por tu pedido ${pedido.codigo} 🦋`

  return (
    <div className="flex flex-col gap-6">
      {aviso && (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
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

      {/* ---------- Estado ---------- */}
      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Estado del pedido</h2>
        <p className="mt-0.5 text-sm text-tinta-media">
          Mientras esté abierto, la clienta todavía no ha confirmado nada por el chat.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ESTADOS_PEDIDO.map((valor) => (
            <button
              key={valor}
              type="button"
              disabled={pendiente || pedido.estado === valor}
              onClick={() => ejecutar(() => cambiarEstado(pedido.id, valor as EstadoPedido))}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition',
                pedido.estado === valor
                  ? 'border-rosa bg-rosa text-white'
                  : 'border-linea-fuerte bg-white text-tinta-media hover:border-rosa hover:text-rosa-hondo',
              )}
            >
              {ETIQUETA_ESTADO[valor]}
            </button>
          ))}
        </div>

        <a
          href={enlaceACliente(pedido.telefono, mensajeParaCliente)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Escribirle a {pedido.clienteNombre.split(' ')[0]} ·{' '}
          {telefonoLegible(pedido.telefono)}
        </a>
      </section>

      {/* ---------- Productos ---------- */}
      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Productos</h2>
        <p className="mt-0.5 text-sm text-tinta-media">
          Puedes cambiar cantidades o agregar lo que pida por el chat.
        </p>

        {pedido.items.length === 0 ? (
          <p className="mt-4 rounded-suave border border-dashed border-linea-fuerte bg-crema px-4 py-6 text-center text-sm text-tinta-media">
            Este pedido quedó sin productos.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-linea">
            {pedido.items.map((item) => (
              <li
                key={item.varianteId}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/producto/${item.productoSlug}`}
                    target="_blank"
                    className="font-semibold hover:text-rosa-hondo hover:underline"
                  >
                    {item.nombre}
                  </Link>
                  <p className="text-sm text-tinta-media">
                    {ETIQUETA_TAMANO[item.tamano]} · {precio(item.precio)} c/u
                  </p>
                </div>

                <div className="flex items-center rounded-full border border-linea-fuerte bg-white">
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() =>
                      ejecutar(() =>
                        cambiarCantidad(pedido.id, item.varianteId, item.cantidad - 1),
                      )
                    }
                    className="grid size-8 place-items-center rounded-l-full text-tinta-media transition hover:text-rosa-hondo disabled:opacity-40"
                    aria-label={`Quitar una unidad de ${item.nombre}`}
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="cifra w-8 text-center text-sm font-semibold">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() =>
                      ejecutar(() =>
                        cambiarCantidad(pedido.id, item.varianteId, item.cantidad + 1),
                      )
                    }
                    className="grid size-8 place-items-center rounded-r-full text-tinta-media transition hover:text-rosa-hondo disabled:opacity-40"
                    aria-label={`Agregar una unidad de ${item.nombre}`}
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                <span className="cifra w-24 text-right font-semibold">
                  {precio(item.precio * item.cantidad)}
                </span>

                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar(() => cambiarCantidad(pedido.id, item.varianteId, 0))}
                  className="grid size-8 place-items-center rounded-full text-tinta-tenue transition hover:bg-rosa-suave hover:text-rosa-hondo"
                  aria-label={`Quitar ${item.nombre} del pedido`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AgregarProducto
          opciones={opciones}
          pendiente={pendiente}
          alAgregar={(varianteId) => ejecutar(() => agregarItem(pedido.id, varianteId))}
        />

        <dl className="mt-5 flex flex-col gap-1.5 border-t border-linea pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-tinta-media">Subtotal</dt>
            <dd className="cifra">{precio(pedido.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tinta-media">Domicilio</dt>
            <dd className="cifra">
              {pedido.domicilio > 0 ? precio(pedido.domicilio) : 'Sin definir'}
            </dd>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <dt>Total</dt>
            <dd className="cifra">{precio(pedido.total)}</dd>
          </div>
        </dl>
      </section>

      {/* ---------- Datos ---------- */}
      <DatosDelPedido pedido={pedido} />

      {/* ---------- Eliminar ---------- */}
      <BorrarPedido pedido={pedido} />
    </div>
  )
}

function AgregarProducto({
  opciones,
  pendiente,
  alAgregar,
}: {
  opciones: Opcion[]
  pendiente: boolean
  alAgregar: (varianteId: string) => void
}) {
  const [elegido, setElegido] = useState('')

  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 rounded-suave bg-crema p-3.5">
      <div className="min-w-52 flex-1">
        <label htmlFor="agregar-producto" className="text-xs font-semibold text-tinta-media">
          Agregar al pedido
        </label>
        <select
          id="agregar-producto"
          value={elegido}
          onChange={(evento) => setElegido(evento.target.value)}
          className="mt-1 w-full rounded-suave border border-linea-fuerte bg-white px-3 py-2 text-sm outline-none focus:border-rosa"
        >
          <option value="">Elige una presentación…</option>
          {opciones.map((opcion) => (
            <option key={opcion.varianteId} value={opcion.varianteId}>
              {opcion.etiqueta} — {precio(opcion.precio)}
              {opcion.disponible ? '' : ' (agotado)'}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={!elegido || pendiente}
        onClick={() => {
          alAgregar(elegido)
          setElegido('')
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden="true" />
        Agregar
      </button>
    </div>
  )
}

function DatosDelPedido({ pedido }: { pedido: Pedido }) {
  const router = useRouter()

  const [estado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(
    async (previo, datos) => {
      const resultado = await guardarDatosPedido(previo, datos)
      if (resultado.ok) router.refresh()
      return resultado
    },
    null,
  )

  return (
    <form action={accion} className="rounded-tarjeta border border-linea bg-white p-5">
      <input type="hidden" name="id" value={pedido.id} />

      <h2 className="font-[family-name:var(--font-display)] text-xl">Datos de entrega</h2>
      <p className="mt-0.5 text-sm text-tinta-media">
        Corrige lo que haga falta después de hablar con la clienta.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MiniCampo etiqueta="Nombre" nombre="clienteNombre">
          <input
            id="clienteNombre"
            name="clienteNombre"
            type="text"
            required
            maxLength={80}
            defaultValue={pedido.clienteNombre}
            className={entrada}
          />
        </MiniCampo>

        <MiniCampo etiqueta="Celular" nombre="telefono">
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            inputMode="numeric"
            defaultValue={pedido.telefono}
            className={cn(entrada, 'cifra')}
          />
        </MiniCampo>

        <MiniCampo etiqueta="Dirección" nombre="direccion">
          <input
            id="direccion"
            name="direccion"
            type="text"
            maxLength={160}
            defaultValue={pedido.direccion ?? ''}
            className={entrada}
          />
        </MiniCampo>

        <MiniCampo etiqueta="Barrio o localidad" nombre="barrio">
          <input
            id="barrio"
            name="barrio"
            type="text"
            maxLength={80}
            defaultValue={pedido.barrio ?? ''}
            className={entrada}
          />
        </MiniCampo>

        <MiniCampo
          etiqueta="Costo del domicilio"
          nombre="domicilio"
          ayuda="En pesos. Déjalo en 0 si no cobras."
        >
          <input
            id="domicilio"
            name="domicilio"
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            defaultValue={pedido.domicilio}
            className={cn(entrada, 'cifra')}
          />
        </MiniCampo>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MiniCampo
          etiqueta="Nota de la clienta"
          nombre="notas"
          ayuda="Lo que escribió al hacer el pedido."
        >
          <textarea
            id="notas"
            name="notas"
            rows={3}
            maxLength={400}
            defaultValue={pedido.notas ?? ''}
            className={cn(entrada, 'resize-y')}
          />
        </MiniCampo>

        <MiniCampo
          etiqueta="Observaciones internas"
          nombre="observacionesInternas"
          ayuda="Solo lo ven ustedes. La clienta nunca ve esto."
        >
          <textarea
            id="observacionesInternas"
            name="observacionesInternas"
            rows={3}
            maxLength={1000}
            defaultValue={pedido.observacionesInternas ?? ''}
            placeholder="Confirmó por WhatsApp. Entrega el sábado."
            className={cn(entrada, 'resize-y')}
          />
        </MiniCampo>
      </div>

      {estado && (
        <p
          role="status"
          className={cn(
            'mt-4 flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
            estado.ok ? 'bg-salvia-suave text-salvia' : 'bg-rosa-suave text-rosa-hondo',
          )}
        >
          {estado.ok ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          {estado.ok ? estado.mensaje : estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
      >
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Guardar datos
      </button>
    </form>
  )
}

function BorrarPedido({ pedido }: { pedido: Pedido }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)

  return (
    <section className="rounded-tarjeta border border-dashed border-linea-fuerte p-5">
      <h2 className="text-sm font-bold">Eliminar el pedido</h2>
      <p className="mt-0.5 text-sm text-tinta-media">
        Si fue un clic falso y no quieres que quede registro. Si solo no se concretó, es mejor
        marcarlo como <strong>cancelado</strong>: así queda el historial.
      </p>

      {confirmando ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-tinta-media">¿Eliminar {pedido.codigo} para siempre?</span>
          <button
            type="button"
            disabled={borrando}
            onClick={async () => {
              setBorrando(true)
              const resultado = await eliminarPedido(pedido.id)
              if (resultado.ok) {
                router.push('/admin/pedidos')
                router.refresh()
              } else {
                setBorrando(false)
                setConfirmando(false)
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-rosa-hondo px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {borrando && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Sí, eliminar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="text-tinta-media hover:underline"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-tinta-tenue transition hover:text-rosa-hondo"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Eliminar este pedido
        </button>
      )}
    </section>
  )
}

const entrada =
  'w-full rounded-suave border border-linea-fuerte bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-rosa'

function MiniCampo({
  etiqueta,
  nombre,
  ayuda,
  children,
}: {
  etiqueta: string
  nombre: string
  ayuda?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nombre} className="text-xs font-semibold text-tinta-media">
        {etiqueta}
      </label>
      {children}
      {ayuda && <p className="text-[0.7rem] text-tinta-tenue">{ayuda}</p>}
    </div>
  )
}
