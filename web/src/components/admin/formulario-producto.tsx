'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, Trash2, X } from 'lucide-react'
import {
  guardarProducto,
  eliminarProducto,
  type ResultadoAccion,
} from '@/lib/admin/acciones-productos'
import { SubidorFoto } from '@/components/admin/subidor-foto'
import type { Producto } from '@/lib/tipos'
import { cn } from '@/lib/utilidades'

/** Sugerencias frecuentes: agilizan el llenado sin limitar lo que se puede escribir. */
const PIELES_SUGERIDAS = ['Todo tipo', 'Seca', 'Grasa', 'Mixta', 'Sensible']
const USOS_SUGERIDOS = ['Facial', 'Corporal']

export function FormularioProducto({
  producto,
  imagenesDisponibles,
  puedeSubir,
}: {
  producto?: Producto
  imagenesDisponibles: string[]
  puedeSubir: boolean
}) {
  const router = useRouter()
  const esNuevo = !producto

  const [estado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(
    async (previo, datos) => {
      const resultado = await guardarProducto(previo, datos)
      if (resultado.ok) {
        router.refresh()
        if (esNuevo && resultado.id) router.push(`/admin/productos/${resultado.id}`)
      }
      return resultado
    },
    null,
  )

  const [imagenes, setImagenes] = useState<string[]>(
    producto?.imagenes.map((i) => i.url) ?? [],
  )

  function alternarImagen(url: string) {
    setImagenes((actuales) =>
      actuales.includes(url) ? actuales.filter((u) => u !== url) : [...actuales, url],
    )
  }

  function agregarImagen(url: string) {
    setImagenes((actuales) => (actuales.includes(url) ? actuales : [...actuales, url]))
  }

  return (
    <form action={accion} className="flex flex-col gap-6">
      {producto && <input type="hidden" name="id" value={producto.id} />}
      <input type="hidden" name="imagenes" value={imagenes.join('\n')} />

      {/* ---------- Lo esencial ---------- */}
      <Bloque titulo="Lo esencial" descripcion="Lo que la clienta ve primero.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" nombre="nombre" requerido>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              maxLength={80}
              defaultValue={producto?.nombre}
              placeholder="Menta y Romero"
              className={entrada}
            />
          </Campo>

          <Campo
            etiqueta="Frase corta"
            nombre="claim"
            ayuda="Aparece sobre la foto. Dos o tres palabras."
          >
            <input
              id="claim"
              name="claim"
              type="text"
              maxLength={60}
              defaultValue={producto?.claim}
              placeholder="Despierta tu piel"
              className={entrada}
            />
          </Campo>
        </div>

        <Campo
          etiqueta="Dirección en la web"
          nombre="slug"
          ayuda={
            producto
              ? `Hoy es /producto/${producto.slug}. Si la cambias, el enlace viejo deja de funcionar.`
              : 'Si lo dejas vacío se genera desde el nombre.'
          }
        >
          <input
            id="slug"
            name="slug"
            type="text"
            maxLength={60}
            defaultValue={producto?.slug}
            placeholder="menta-romero"
            className={cn(entrada, 'cifra')}
          />
        </Campo>

        <Campo
          etiqueta="Descripción"
          nombre="descripcion"
          ayuda="Un párrafo que cuente para qué sirve y a quién le va bien."
        >
          <textarea
            id="descripcion"
            name="descripcion"
            rows={5}
            maxLength={2000}
            defaultValue={producto?.descripcion}
            placeholder="Un jabón que se siente como abrir la ventana…"
            className={cn(entrada, 'resize-y')}
          />
        </Campo>
      </Bloque>

      {/* ---------- Ficha ---------- */}
      <Bloque
        titulo="Ficha del producto"
        descripcion="Una línea por elemento. Los beneficios salen en la ficha y en el folleto."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Beneficios" nombre="beneficios" ayuda="Seis funcionan bien.">
            <textarea
              id="beneficios"
              name="beneficios"
              rows={6}
              defaultValue={producto?.beneficios.join('\n')}
              placeholder={'Refresca y revitaliza\nAyuda a controlar la grasa'}
              className={cn(entrada, 'resize-y')}
            />
          </Campo>

          <Campo etiqueta="Ingredientes" nombre="ingredientes">
            <textarea
              id="ingredientes"
              name="ingredientes"
              rows={6}
              defaultValue={producto?.ingredientes.join('\n')}
              placeholder={'Base de glicerina vegetal\nInfusión de romero'}
              className={cn(entrada, 'resize-y')}
            />
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Tipo de piel"
            nombre="tipoDePiel"
            ayuda={`Sugerencias: ${PIELES_SUGERIDAS.join(', ')}`}
          >
            <textarea
              id="tipoDePiel"
              name="tipoDePiel"
              rows={3}
              defaultValue={producto?.tipoDePiel.join('\n')}
              placeholder={'Mixta\nGrasa'}
              className={cn(entrada, 'resize-y')}
            />
          </Campo>

          <Campo
            etiqueta="Uso"
            nombre="uso"
            ayuda={`Sugerencias: ${USOS_SUGERIDOS.join(', ')}`}
          >
            <textarea
              id="uso"
              name="uso"
              rows={3}
              defaultValue={producto?.uso.join('\n')}
              placeholder={'Facial\nCorporal'}
              className={cn(entrada, 'resize-y')}
            />
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Aroma" nombre="aroma">
            <input
              id="aroma"
              name="aroma"
              type="text"
              maxLength={120}
              defaultValue={producto?.aroma}
              placeholder="Herbal fresco, mentolado"
              className={entrada}
            />
          </Campo>

          <Campo
            etiqueta="Color de la receta"
            nombre="colorMarca"
            ayuda="Pinta la etiqueta de la frase corta. Que sea oscuro para que el texto blanco se lea."
          >
            <div className="flex items-center gap-2">
              <input
                id="colorMarca"
                name="colorMarca"
                type="color"
                defaultValue={producto?.colorMarca ?? '#b14372'}
                className="size-11 cursor-pointer rounded-suave border border-linea-fuerte bg-white p-1"
              />
              <span className="text-sm text-tinta-tenue">
                Toca el cuadro para elegir el color
              </span>
            </div>
          </Campo>
        </div>

        <Campo etiqueta="Modo de uso" nombre="modoDeUso">
          <textarea
            id="modoDeUso"
            name="modoDeUso"
            rows={3}
            maxLength={1000}
            defaultValue={producto?.modoDeUso}
            placeholder="Humedece la piel, frota hasta obtener espuma…"
            className={cn(entrada, 'resize-y')}
          />
        </Campo>

        <Campo
          etiqueta="Advertencia"
          nombre="advertencia"
          ayuda="Solo si hace falta. Aparece destacada en la ficha."
        >
          <textarea
            id="advertencia"
            name="advertencia"
            rows={2}
            maxLength={500}
            defaultValue={producto?.advertencia ?? ''}
            placeholder="Contiene cúrcuma. Haz una prueba en una zona pequeña…"
            className={cn(entrada, 'resize-y')}
          />
        </Campo>
      </Bloque>

      {/* ---------- Fotos ---------- */}
      <Bloque
        titulo="Fotos"
        descripcion="La primera que elijas es la portada. Toca para poner y quitar."
      >
        {imagenes.length > 0 && (
          <ol className="flex flex-wrap gap-2">
            {imagenes.map((url, indice) => (
              <li key={url} className="relative">
                <Image
                  src={url}
                  alt=""
                  width={92}
                  height={92}
                  className="size-23 rounded-suave border-2 border-rosa bg-crema object-cover"
                />
                <span className="absolute left-1 top-1 rounded-full bg-rosa px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                  {indice === 0 ? 'Portada' : indice + 1}
                </span>
                <button
                  type="button"
                  onClick={() => alternarImagen(url)}
                  className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full border border-linea bg-white text-tinta-media shadow-tarjeta transition hover:text-rosa-hondo"
                  aria-label={`Quitar la foto ${indice + 1}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <SubidorFoto
          nombreBase={producto?.slug ?? 'jabon'}
          habilitado={puedeSubir}
          alSubir={agregarImagen}
        />

        <details className="rounded-suave border border-linea bg-crema px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Elegir de las fotos disponibles ({imagenesDisponibles.length})
          </summary>
          <ul className="mt-3 flex flex-wrap gap-2">
            {imagenesDisponibles.map((url) => {
              const elegida = imagenes.includes(url)
              return (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => alternarImagen(url)}
                    aria-pressed={elegida}
                    className={cn(
                      'block rounded-suave border-2 p-0.5 transition',
                      elegida ? 'border-rosa' : 'border-transparent hover:border-linea-fuerte',
                    )}
                  >
                    <Image
                      src={url}
                      alt={url.split('/').pop() ?? ''}
                      width={72}
                      height={72}
                      className="size-18 rounded-[0.6rem] bg-crema object-cover"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </details>

      </Bloque>

      {/* ---------- Visibilidad ---------- */}
      <Bloque titulo="Visibilidad">
        <label className="flex items-start gap-3 rounded-suave border border-linea bg-crema px-4 py-3">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto?.activo ?? true}
            className="mt-0.5 size-4 accent-[#e07fae]"
          />
          <span>
            <span className="block font-semibold">Visible en la tienda</span>
            <span className="block text-sm text-tinta-media">
              Si lo desmarcas, deja de aparecer sin borrarse.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-suave border border-linea bg-crema px-4 py-3">
          <input
            type="checkbox"
            name="destacado"
            defaultChecked={producto?.destacado ?? false}
            className="mt-0.5 size-4 accent-[#e07fae]"
          />
          <span>
            <span className="block font-semibold">Destacado en la portada</span>
            <span className="block text-sm text-tinta-media">
              Aparece en «Los más pedidos».
            </span>
          </span>
        </label>
      </Bloque>

      {/* ---------- Resultado y acciones ---------- */}
      {estado && (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
            estado.ok
              ? 'bg-salvia-suave text-salvia'
              : 'bg-rosa-suave text-rosa-hondo',
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

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-linea bg-crema-hondo/95 px-4 py-3 backdrop-blur-md">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-7 py-3 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {esNuevo ? 'Crear producto' : 'Guardar cambios'}
        </button>

        <Link
          href="/admin/productos"
          className="rounded-full border border-linea-fuerte bg-white px-5 py-3 text-sm text-tinta-media transition hover:border-rosa hover:text-rosa-hondo"
        >
          Volver al catálogo
        </Link>

        {producto && (
          <>
            <Link
              href={`/producto/${producto.slug}`}
              target="_blank"
              className="text-sm text-tinta-media underline-offset-4 hover:text-rosa-hondo hover:underline"
            >
              Ver en la tienda
            </Link>
            <BotonEliminar producto={producto} />
          </>
        )}
      </div>
    </form>
  )
}

function BotonEliminar({ producto }: { producto: Producto }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="ml-auto inline-flex items-center gap-1.5 text-sm text-tinta-tenue transition hover:text-rosa-hondo"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        Eliminar
      </button>
    )
  }

  return (
    <span className="ml-auto flex items-center gap-2 text-sm">
      <span className="text-tinta-media">¿Eliminar «{producto.nombre}»?</span>
      <button
        type="button"
        disabled={borrando}
        onClick={async () => {
          setBorrando(true)
          const resultado = await eliminarProducto(producto.id)
          if (resultado.ok) {
            router.push('/admin/productos')
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
    </span>
  )
}

const entrada =
  'w-full rounded-suave border border-linea-fuerte bg-white px-4 py-2.5 text-[0.95rem] outline-none transition placeholder:text-tinta-tenue/60 focus:border-rosa'

function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-tarjeta border border-linea bg-white p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl">{titulo}</h2>
      {descripcion && <p className="mt-0.5 text-sm text-tinta-media">{descripcion}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Campo({
  etiqueta,
  nombre,
  ayuda,
  requerido,
  children,
}: {
  etiqueta: string
  nombre: string
  ayuda?: string
  requerido?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nombre} className="text-sm font-semibold">
        {etiqueta}
        {requerido && <span className="ml-1 text-rosa-hondo">*</span>}
      </label>
      {children}
      {ayuda && <p className="text-xs text-tinta-tenue">{ayuda}</p>}
    </div>
  )
}
