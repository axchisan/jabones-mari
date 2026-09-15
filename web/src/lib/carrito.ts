'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ItemCarrito, Producto, Variante } from '@/lib/tipos'

type EstadoCarrito = {
  items: ItemCarrito[]
  abierto: boolean
  hidratado: boolean
  /**
   * Lo que se recortó por falta de existencias. Se queda hasta que la clienta
   * lo cierra: es la única explicación de por qué desapareció algo que había
   * elegido, y si se borrara sola no le quedaría manera de enterarse.
   */
  ajustes: string[]
  agregar: (producto: Producto, variante: Variante) => void
  quitar: (varianteId: string) => void
  cambiarCantidad: (varianteId: string, cantidad: number) => void
  /** Devuelve los avisos nuevos, para que quien llame pueda reaccionar. */
  sincronizarLimites: (limites: Record<string, number | null>) => string[]
  olvidarAjustes: () => void
  vaciar: () => void
  abrir: () => void
  cerrar: () => void
}

/**
 * Tope de cortesía para las presentaciones sin control de inventario. No es
 * una regla de negocio: el límite real lo pone el stock y lo comprueba el
 * servidor al crear el pedido. Esto solo evita que alguien escriba 5000 en el
 * cuadrito de cantidad.
 */
const LIMITE_POR_ITEM = 99

/** Cuánto se puede llevar de una línea: su stock, o el tope de cortesía. */
function topeDe(item: { limite?: number | null }): number {
  // Un carrito guardado antes de que existiera el control de stock no trae
  // `limite`; se trata como sin límite hasta que el servidor diga otra cosa.
  const limite = item.limite ?? null
  return limite === null ? LIMITE_POR_ITEM : Math.min(limite, LIMITE_POR_ITEM)
}

export const usarCarrito = create<EstadoCarrito>()(
  persist(
    (set, get) => ({
      items: [],
      abierto: false,
      hidratado: false,
      ajustes: [],

      agregar: (producto, variante) =>
        set((estado) => {
          const limite = variante.disponibles
          const existente = estado.items.find((i) => i.varianteId === variante.id)

          if (existente) {
            const tope = topeDe({ limite })
            return {
              abierto: true,
              items: estado.items.map((i) =>
                i.varianteId === variante.id
                  ? { ...i, limite, cantidad: Math.min(i.cantidad + 1, tope) }
                  : i,
              ),
            }
          }

          const nuevo: ItemCarrito = {
            varianteId: variante.id,
            productoSlug: producto.slug,
            nombre: producto.nombre,
            tamano: variante.tamano,
            precio: variante.precio,
            imagen: producto.imagenes[0]?.url ?? '',
            cantidad: 1,
            limite,
          }
          return { abierto: true, items: [...estado.items, nuevo] }
        }),

      quitar: (varianteId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.varianteId !== varianteId),
        })),

      cambiarCantidad: (varianteId, cantidad) =>
        set((estado) => ({
          items:
            cantidad <= 0
              ? estado.items.filter((i) => i.varianteId !== varianteId)
              : estado.items.map((i) =>
                  i.varianteId === varianteId
                    ? { ...i, cantidad: Math.min(cantidad, topeDe(i)) }
                    : i,
                ),
        })),

      /**
       * Pone al día los topes con lo que dice el servidor y recorta lo que ya
       * no alcanza. Un carrito guardado hace días puede tener cantidades que
       * dejaron de existir; mejor avisarlo aquí que en el último paso.
       */
      sincronizarLimites: (limites) => {
        const estado = get()
        const nuevos: string[] = []

        const items = estado.items.flatMap((item) => {
          if (!(item.varianteId in limites)) return [item]

          const limite = limites[item.varianteId]
          const actualizado = { ...item, limite }
          const tope = topeDe(actualizado)

          if (tope === 0) {
            nuevos.push(
              `${item.nombre} (${item.tamano === 'grande' ? 'grande' : 'pequeño'}) se agotó, así que lo sacamos de tu carrito`,
            )
            return []
          }

          if (actualizado.cantidad > tope) {
            nuevos.push(
              `De ${item.nombre} (${item.tamano === 'grande' ? 'grande' : 'pequeño'}) solo ${tope === 1 ? 'queda 1' : `quedan ${tope}`}, así que ajustamos la cantidad`,
            )
            return [{ ...actualizado, cantidad: tope }]
          }

          return [actualizado]
        })

        // Se suman a los que ya había, sin repetir. Quitar un jabón agotado
        // cambia la lista y dispara otra sincronización enseguida: si esta
        // reemplazara los avisos, el mensaje se borraría antes de leerse.
        const ajustes =
          nuevos.length > 0
            ? [...estado.ajustes, ...nuevos.filter((a) => !estado.ajustes.includes(a))]
            : estado.ajustes

        set({ items, ajustes })
        return nuevos
      },

      olvidarAjustes: () => set({ ajustes: [] }),
      vaciar: () => set({ items: [], ajustes: [] }),
      abrir: () => set({ abierto: true }),
      cerrar: () => set({ abierto: false }),
    }),
    {
      name: 'carrito-mari',
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ items: estado.items }),
      onRehydrateStorage: () => (estado) => {
        if (estado) estado.hidratado = true
      },
    },
  ),
)

/** El tope aplicable a una línea del carrito. */
export function limiteDe(item: ItemCarrito): number {
  return topeDe(item)
}

export function subtotalDe(items: ItemCarrito[]): number {
  return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
}

export function unidadesDe(items: ItemCarrito[]): number {
  return items.reduce((suma, i) => suma + i.cantidad, 0)
}
