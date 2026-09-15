'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { registrarVentaManual } from '@/lib/admin/acciones-venta-manual'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'
import { precio } from '@/lib/formato'
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

type Presentacion = {
  varianteId: string
  etiqueta: string
  precio: number
  activo: boolean
}

type Linea = { id: number; varianteId: string; cantidad: number }

export function FormularioVentaManual({
  presentaciones,
}: {
  presentaciones: Presentacion[]
}) {
  const router = useRouter()
  const [lineas, setLineas] = useState<Linea[]>([{ id: 1, varianteId: '', cantidad: 1 }])
  const [domicilio, setDomicilio] = useState(0)

  const [estado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(
    async (previo, datos) => {
      const resultado = await registrarVentaManual(previo, datos)
      if (resultado.ok) {
        setLineas([{ id: Date.now(), varianteId: '', cantidad: 1 }])
        setDomicilio(0)
        router.refresh()
      }
      return resultado
    },
    null,
  )

  const precioDe = (varianteId: string) =>
    presentaciones.find((p) => p.varianteId === varianteId)?.precio ?? 0

  const subtotal = lineas.reduce(
    (suma, linea) => suma + precioDe(linea.varianteId) * linea.cantidad,
    0,
  )

  function cambiar(id: number, cambios: Partial<Linea>) {
    setLineas((actuales) =>
      actuales.map((linea) => (linea.id === id ? { ...linea, ...cambios } : linea)),
    )
  }

  return (
    <form action={accion} className="flex flex-col gap-6">
      {/* ---------- Productos ---------- */}
      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Qué se vendió</h2>
        <p className="mt-0.5 text-sm text-tinta-media">
          Los precios son los del catálogo y quedan congelados en esta venta.
        </p>

        <ul className="mt-4 flex flex-col gap-3">
          {lineas.map((linea) => (
            <li key={linea.id} className="flex flex-wrap items-end gap-3">
              <div className="min-w-52 flex-1">
                <label
                  htmlFor={`producto-${linea.id}`}
                  className="text-xs font-semibold text-tinta-media"
                >
                  Producto
                </label>
                <select
                  id={`producto-${linea.id}`}
                  name="varianteId"
                  value={linea.varianteId}
                  onChange={(evento) => cambiar(linea.id, { varianteId: evento.target.value })}
                  className="mt-1 w-full rounded-suave border border-linea-fuerte bg-white px-3 py-2 text-sm outline-none focus:border-rosa"
                >
                  <option value="">Elige una presentación…</option>
                  {presentaciones.map((p) => (
                    <option key={p.varianteId} value={p.varianteId}>
                      {p.etiqueta} — {precio(p.precio)}
                      {p.activo ? '' : ' (oculto)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label
                  htmlFor={`cantidad-${linea.id}`}
                  className="text-xs font-semibold text-tinta-media"
                >
                  Cantidad
                </label>
                <input
                  id={`cantidad-${linea.id}`}
                  name="cantidad"
                  type="number"
                  min={1}
                  max={999}
                  inputMode="numeric"
                  value={linea.cantidad}
                  onChange={(evento) =>
                    cambiar(linea.id, { cantidad: Number(evento.target.value) || 1 })
                  }
                  className="cifra mt-1 w-full rounded-suave border border-linea-fuerte bg-white px-3 py-2 text-sm outline-none focus:border-rosa"
                />
              </div>

              <span className="cifra w-24 pb-2 text-right font-semibold">
                {precio(precioDe(linea.varianteId) * linea.cantidad)}
              </span>

              {lineas.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLineas((a) => a.filter((l) => l.id !== linea.id))}
                  className="mb-1 grid size-9 place-items-center rounded-full text-tinta-tenue transition hover:bg-rosa-suave hover:text-rosa-hondo"
                  aria-label="Quitar este producto"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() =>
            setLineas((a) => [...a, { id: Date.now(), varianteId: '', cantidad: 1 }])
          }
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm transition hover:border-rosa hover:text-rosa-hondo"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar otro producto
        </button>

        <dl className="mt-5 flex flex-col gap-1.5 border-t border-linea pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-tinta-media">Subtotal</dt>
            <dd className="cifra">{precio(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tinta-media">Domicilio</dt>
            <dd className="cifra">{precio(domicilio)}</dd>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <dt>Total</dt>
            <dd className="cifra">{precio(subtotal + domicilio)}</dd>
          </div>
        </dl>
      </section>

      {/* ---------- Clienta ---------- */}
      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">A quién</h2>
        <p className="mt-0.5 text-sm text-tinta-media">
          Solo el nombre es obligatorio. Si fue una venta de mostrador, con eso basta.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Mini etiqueta="Nombre" nombre="venta-nombre">
            <input
              id="venta-nombre"
              name="clienteNombre"
              type="text"
              required
              maxLength={80}
              placeholder="Laura Gómez"
              className={entrada}
            />
          </Mini>

          <Mini etiqueta="Celular" nombre="venta-telefono" ayuda="Opcional">
            <input
              id="venta-telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              placeholder="321 288 1565"
              className={cn(entrada, 'cifra')}
            />
          </Mini>

          <Mini etiqueta="Correo" nombre="venta-correo" ayuda="Opcional">
            <input
              id="venta-correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              className={entrada}
            />
          </Mini>

          <Mini etiqueta="Barrio" nombre="venta-barrio" ayuda="Opcional">
            <input
              id="venta-barrio"
              name="barrio"
              type="text"
              maxLength={80}
              placeholder="Cedritos"
              className={entrada}
            />
          </Mini>

          <div className="sm:col-span-2">
            <Mini etiqueta="Dirección" nombre="venta-direccion" ayuda="Opcional">
              <input
                id="venta-direccion"
                name="direccion"
                type="text"
                maxLength={160}
                placeholder="Calle 134 #58-20"
                className={entrada}
              />
            </Mini>
          </div>
        </div>
      </section>

      {/* ---------- Detalles ---------- */}
      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Detalles</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Mini etiqueta="Estado" nombre="venta-estado" ayuda="Normalmente ya está entregada.">
            <select
              id="venta-estado"
              name="estado"
              defaultValue="entregado"
              className={entrada}
            >
              {ESTADOS_PEDIDO.map((valor) => (
                <option key={valor} value={valor}>
                  {ETIQUETA_ESTADO[valor]}
                </option>
              ))}
            </select>
          </Mini>

          <Mini etiqueta="Domicilio cobrado" nombre="venta-domicilio" ayuda="En pesos.">
            <input
              id="venta-domicilio"
              name="domicilio"
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              value={domicilio}
              onChange={(evento) => setDomicilio(Number(evento.target.value) || 0)}
              className={cn(entrada, 'cifra')}
            />
          </Mini>

          <div className="sm:col-span-2">
            <Mini
              etiqueta="Notas internas"
              nombre="venta-notas"
              ayuda="Dónde fue la venta, cómo pagó, lo que quieras recordar."
            >
              <textarea
                id="venta-notas"
                name="notasInternas"
                rows={2}
                maxLength={1000}
                placeholder="Venta en la feria del barrio, pagó en efectivo"
                className={cn(entrada, 'resize-y')}
              />
            </Mini>
          </div>
        </div>
      </section>

      {estado && (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
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

      <div>
        <button
          type="submit"
          disabled={enviando || subtotal === 0}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-7 py-3.5 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-50"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Registrar la venta
        </button>
        <p className="mt-2 text-xs text-tinta-tenue">
          Queda en el historial marcada como registrada a mano, y no dispara avisos.
        </p>
      </div>
    </form>
  )
}

const entrada =
  'w-full rounded-suave border border-linea-fuerte bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-rosa'

function Mini({
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
