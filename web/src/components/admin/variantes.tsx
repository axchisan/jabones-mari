'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, Trash2, Plus, Pencil, X } from 'lucide-react'
import {
  guardarVariante,
  eliminarVariante,
  type ResultadoAccion,
} from '@/lib/admin/acciones-productos'
import { precio } from '@/lib/formato'
import { ETIQUETA_TAMANO, type Variante } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

export function Presentaciones({
  productoId,
  variantes,
}: {
  productoId: string
  variantes: Variante[]
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const [agregando, setAgregando] = useState(false)

  return (
    <section className="rounded-tarjeta border border-linea bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl">Presentaciones</h2>
          <p className="mt-0.5 text-sm text-tinta-media">
            Los tamaños con su precio y su inventario. Sin al menos una, el producto no se
            puede comprar.
          </p>
        </div>
        {!agregando && (
          <button
            type="button"
            onClick={() => {
              setAgregando(true)
              setEditando(null)
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm font-semibold text-tinta transition hover:border-rosa hover:text-rosa-hondo"
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar presentación
          </button>
        )}
      </div>

      {variantes.length === 0 && !agregando && (
        <p className="mt-4 rounded-suave border border-dashed border-linea-fuerte bg-crema px-4 py-6 text-center text-sm text-tinta-media">
          Este producto todavía no se puede comprar. Agrégale al menos una presentación.
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {variantes.map((variante) =>
          editando === variante.id ? (
            <li key={variante.id}>
              <FormularioVariante
                productoId={productoId}
                variante={variante}
                alTerminar={() => setEditando(null)}
              />
            </li>
          ) : (
            <li key={variante.id}>
              <FilaVariante
                variante={variante}
                alEditar={() => {
                  setEditando(variante.id)
                  setAgregando(false)
                }}
              />
            </li>
          ),
        )}

        {agregando && (
          <li>
            <FormularioVariante
              productoId={productoId}
              alTerminar={() => setAgregando(false)}
            />
          </li>
        )}
      </ul>
    </section>
  )
}

function FilaVariante({
  variante,
  alEditar,
}: {
  variante: Variante
  alEditar: () => void
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-suave border px-4 py-3',
        variante.disponible ? 'border-linea bg-crema' : 'border-dashed border-linea-fuerte',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{ETIQUETA_TAMANO[variante.tamano]}</span>
          <span className="cifra text-lg">{precio(variante.precio)}</span>
          {!variante.disponible && (
            <span className="rounded-full bg-rosa-suave px-2 py-0.5 text-[0.65rem] text-rosa-hondo">
              Agotado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-tinta-media">
          <span className="cifra">{variante.sku}</span>
          {variante.stock !== null && <> · {variante.stock} unidades</>}
          {variante.pesoGramos !== null && <> · {variante.pesoGramos} g</>}
          {variante.molde && <> · {variante.molde}</>}
        </p>
      </div>

      {confirmando ? (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-tinta-media">¿Eliminar?</span>
          <button
            type="button"
            disabled={borrando}
            onClick={async () => {
              setBorrando(true)
              await eliminarVariante(variante.id)
              router.refresh()
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-rosa-hondo px-3.5 py-1.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {borrando && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Sí
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="text-tinta-media hover:underline"
          >
            No
          </button>
        </span>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={alEditar}
            className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-3.5 py-1.5 text-sm transition hover:border-rosa hover:text-rosa-hondo"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="grid size-8 place-items-center rounded-full text-tinta-tenue transition hover:bg-rosa-suave hover:text-rosa-hondo"
            aria-label={`Eliminar la presentación ${ETIQUETA_TAMANO[variante.tamano]}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

function FormularioVariante({
  productoId,
  variante,
  alTerminar,
}: {
  productoId: string
  variante?: Variante
  alTerminar: () => void
}) {
  const router = useRouter()

  const [estado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(
    async (previo, datos) => {
      const resultado = await guardarVariante(previo, datos)
      if (resultado.ok) {
        router.refresh()
        alTerminar()
      }
      return resultado
    },
    null,
  )

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-suave border-2 border-rosa bg-rosa-niebla p-4"
    >
      <input type="hidden" name="productoId" value={productoId} />
      {variante && <input type="hidden" name="id" value={variante.id} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini etiqueta="Tamaño" nombre={`tamano-${variante?.id ?? 'nueva'}`}>
          <select
            id={`tamano-${variante?.id ?? 'nueva'}`}
            name="tamano"
            defaultValue={variante?.tamano ?? 'grande'}
            className={entradaMini}
          >
            <option value="grande">Grande</option>
            <option value="pequeno">Pequeño</option>
          </select>
        </Mini>

        <Mini etiqueta="Precio (COP)" nombre={`precio-${variante?.id ?? 'nueva'}`}>
          <input
            id={`precio-${variante?.id ?? 'nueva'}`}
            name="precio"
            type="number"
            required
            min={0}
            step={100}
            inputMode="numeric"
            defaultValue={variante?.precio ?? 7500}
            className={cn(entradaMini, 'cifra')}
          />
        </Mini>

        <Mini etiqueta="SKU" nombre={`sku-${variante?.id ?? 'nueva'}`}>
          <input
            id={`sku-${variante?.id ?? 'nueva'}`}
            name="sku"
            type="text"
            required
            maxLength={40}
            defaultValue={variante?.sku}
            placeholder="MENTA-G"
            className={cn(entradaMini, 'cifra')}
          />
        </Mini>

        <Mini
          etiqueta="Inventario"
          nombre={`stock-${variante?.id ?? 'nueva'}`}
          ayuda="Vacío = no se lleva cuenta"
        >
          <input
            id={`stock-${variante?.id ?? 'nueva'}`}
            name="stock"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={variante?.stock ?? ''}
            placeholder="—"
            className={cn(entradaMini, 'cifra')}
          />
        </Mini>

        <Mini etiqueta="Peso (g)" nombre={`peso-${variante?.id ?? 'nueva'}`}>
          <input
            id={`peso-${variante?.id ?? 'nueva'}`}
            name="pesoGramos"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={variante?.pesoGramos ?? ''}
            placeholder="100"
            className={cn(entradaMini, 'cifra')}
          />
        </Mini>

        <div className="sm:col-span-2 lg:col-span-3">
          <Mini etiqueta="Molde" nombre={`molde-${variante?.id ?? 'nueva'}`}>
            <input
              id={`molde-${variante?.id ?? 'nueva'}`}
              name="molde"
              type="text"
              maxLength={120}
              defaultValue={variante?.molde}
              placeholder="Corazón, óvalo o flor, según disponibilidad"
              className={entradaMini}
            />
          </Mini>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="disponible"
          defaultChecked={variante?.disponible ?? true}
          className="size-4 accent-[#e07fae]"
        />
        Disponible para comprar
      </label>

      {estado && !estado.ok && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-suave bg-rosa-suave px-3.5 py-2.5 text-sm text-rosa-hondo"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {estado.error}
        </p>
      )}

      {estado?.ok && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-suave bg-salvia-suave px-3.5 py-2.5 text-sm text-salvia"
        >
          <Check className="size-4 shrink-0" aria-hidden="true" />
          {estado.mensaje}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {variante ? 'Guardar' : 'Agregar'}
        </button>
        <button
          type="button"
          onClick={alTerminar}
          className="inline-flex items-center gap-1.5 rounded-full border border-linea-fuerte bg-white px-4 py-2.5 text-sm text-tinta-media transition hover:text-tinta"
        >
          <X className="size-3.5" aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  )
}

const entradaMini =
  'w-full rounded-suave border border-linea-fuerte bg-white px-3 py-2 text-sm outline-none transition focus:border-rosa'

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
    <div className="flex flex-col gap-1">
      <label htmlFor={nombre} className="text-xs font-semibold text-tinta-media">
        {etiqueta}
      </label>
      {children}
      {ayuda && <p className="text-[0.7rem] text-tinta-tenue">{ayuda}</p>}
    </div>
  )
}
