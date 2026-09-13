'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ItemCarrito, Producto, Variante } from '@/lib/tipos'

type EstadoCarrito = {
  items: ItemCarrito[]
  abierto: boolean
  hidratado: boolean
  agregar: (producto: Producto, variante: Variante) => void
  quitar: (varianteId: string) => void
  cambiarCantidad: (varianteId: string, cantidad: number) => void
  vaciar: () => void
  abrir: () => void
  cerrar: () => void
}

const LIMITE_POR_ITEM = 99

export const usarCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      abierto: false,
      hidratado: false,

      agregar: (producto, variante) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.varianteId === variante.id)
          if (existente) {
            return {
              abierto: true,
              items: estado.items.map((i) =>
                i.varianteId === variante.id
                  ? { ...i, cantidad: Math.min(i.cantidad + 1, LIMITE_POR_ITEM) }
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
                    ? { ...i, cantidad: Math.min(cantidad, LIMITE_POR_ITEM) }
                    : i,
                ),
        })),

      vaciar: () => set({ items: [] }),
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

export function subtotalDe(items: ItemCarrito[]): number {
  return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
}

export function unidadesDe(items: ItemCarrito[]): number {
  return items.reduce((suma, i) => suma + i.cantidad, 0)
}
