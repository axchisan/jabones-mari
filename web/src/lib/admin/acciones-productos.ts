'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db, esquema } from '@/lib/db/cliente'
import { requerirAdmin } from '@/lib/auth/sesion'
import type { Tamano } from '@/lib/tipos'

/**
 * Todo cambio del catálogo pasa por aquí. Cada acción verifica el rol
 * antes de tocar nada y refresca las páginas públicas al terminar, para
 * que la tienda muestre el cambio de inmediato y no en cinco minutos.
 */

function baseDeDatos() {
  if (!db) throw new Error('Falta DATABASE_URL')
  return db
}

function refrescarTienda(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/catalogo')
  revalidatePath('/nosotros')
  revalidatePath('/admin/productos')
  if (slug) revalidatePath(`/producto/${slug}`)
}

/** Convierte "Cúrcuma y Miel" en "curcuma-y-miel". */
function aSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Una lista escrita como texto, una por línea, se guarda como arreglo. */
function aLista(valor: FormDataEntryValue | null): string[] {
  if (typeof valor !== 'string') return []
  return valor
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
}

const esquemaProducto = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio').max(80),
  slug: z.string().trim().max(60).optional(),
  claim: z.string().trim().max(60),
  descripcion: z.string().trim().max(2000),
  modoDeUso: z.string().trim().max(1000),
  advertencia: z.string().trim().max(500),
  aroma: z.string().trim().max(120),
  colorMarca: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Usa un color en formato #RRGGBB'),
  destacado: z.boolean(),
  activo: z.boolean(),
})

export type ResultadoAccion =
  | { ok: true; mensaje: string; id?: string }
  | { ok: false; error: string }

export async function guardarProducto(
  _estadoPrevio: ResultadoAccion | null,
  datos: FormData,
): Promise<ResultadoAccion> {
  await requerirAdmin()
  const conexion = baseDeDatos()

  const id = String(datos.get('id') ?? '').trim()
  const esNuevo = !id

  const analisis = esquemaProducto.safeParse({
    nombre: datos.get('nombre'),
    slug: datos.get('slug'),
    claim: datos.get('claim') ?? '',
    descripcion: datos.get('descripcion') ?? '',
    modoDeUso: datos.get('modoDeUso') ?? '',
    advertencia: datos.get('advertencia') ?? '',
    aroma: datos.get('aroma') ?? '',
    colorMarca: datos.get('colorMarca') || '#b14372',
    destacado: datos.get('destacado') === 'on',
    activo: datos.get('activo') === 'on',
  })

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' }
  }

  const valores = analisis.data
  const slug = aSlug(valores.slug || valores.nombre)

  if (!slug) {
    return { ok: false, error: 'No se pudo generar la dirección del producto' }
  }

  // El slug es la dirección pública: no puede repetirse.
  const [choque] = await conexion
    .select({ id: esquema.productos.id })
    .from(esquema.productos)
    .where(eq(esquema.productos.slug, slug))
    .limit(1)

  if (choque && choque.id !== id) {
    return { ok: false, error: `Ya hay otro producto usando la dirección "${slug}"` }
  }

  const imagenes = aLista(datos.get('imagenes')).map((url) => ({
    url,
    alt: `${valores.nombre}, jabón artesanal de Mari`,
  }))

  const fila = {
    slug,
    nombre: valores.nombre,
    claim: valores.claim || null,
    descripcion: valores.descripcion || null,
    modoDeUso: valores.modoDeUso || null,
    advertencia: valores.advertencia || null,
    ingredientes: aLista(datos.get('ingredientes')),
    beneficios: aLista(datos.get('beneficios')),
    tipoDePiel: aLista(datos.get('tipoDePiel')),
    uso: aLista(datos.get('uso')),
    aroma: valores.aroma || null,
    colorMarca: valores.colorMarca,
    imagenes,
    destacado: valores.destacado,
    activo: valores.activo,
    actualizadoEn: new Date(),
  }

  try {
    if (esNuevo) {
      const [{ siguiente }] = await conexion
        .select({ siguiente: sql<number>`coalesce(max(${esquema.productos.orden}), 0) + 1` })
        .from(esquema.productos)

      const nuevoId = randomUUID()
      await conexion.insert(esquema.productos).values({
        ...fila,
        id: nuevoId,
        orden: siguiente,
      })

      refrescarTienda(slug)
      return { ok: true, mensaje: `"${valores.nombre}" quedó creado`, id: nuevoId }
    }

    const [anterior] = await conexion
      .select({ slug: esquema.productos.slug })
      .from(esquema.productos)
      .where(eq(esquema.productos.id, id))
      .limit(1)

    await conexion.update(esquema.productos).set(fila).where(eq(esquema.productos.id, id))

    refrescarTienda(slug)
    if (anterior && anterior.slug !== slug) refrescarTienda(anterior.slug)

    return { ok: true, mensaje: 'Cambios guardados', id }
  } catch (error) {
    console.error('[admin] no se pudo guardar el producto', error)
    return { ok: false, error: 'No se pudo guardar. Intenta de nuevo.' }
  }
}

export async function alternarActivo(id: string, activo: boolean): Promise<ResultadoAccion> {
  await requerirAdmin()

  const [fila] = await baseDeDatos()
    .update(esquema.productos)
    .set({ activo, actualizadoEn: new Date() })
    .where(eq(esquema.productos.id, id))
    .returning({ slug: esquema.productos.slug, nombre: esquema.productos.nombre })

  if (!fila) return { ok: false, error: 'No encontramos ese producto' }

  refrescarTienda(fila.slug)
  return {
    ok: true,
    mensaje: activo ? `"${fila.nombre}" está visible` : `"${fila.nombre}" quedó oculto`,
  }
}

export async function alternarDestacado(
  id: string,
  destacado: boolean,
): Promise<ResultadoAccion> {
  await requerirAdmin()

  const [fila] = await baseDeDatos()
    .update(esquema.productos)
    .set({ destacado, actualizadoEn: new Date() })
    .where(eq(esquema.productos.id, id))
    .returning({ slug: esquema.productos.slug })

  if (!fila) return { ok: false, error: 'No encontramos ese producto' }

  refrescarTienda(fila.slug)
  return { ok: true, mensaje: destacado ? 'Destacado en la portada' : 'Ya no está destacado' }
}

/** Sube o baja un producto en el orden del catálogo. */
export async function moverProducto(
  id: string,
  direccion: 'arriba' | 'abajo',
): Promise<ResultadoAccion> {
  await requerirAdmin()
  const conexion = baseDeDatos()

  const productos = await conexion
    .select({ id: esquema.productos.id })
    .from(esquema.productos)
    .orderBy(esquema.productos.orden)

  const indice = productos.findIndex((p) => p.id === id)
  if (indice === -1) return { ok: false, error: 'No encontramos ese producto' }

  const destino = direccion === 'arriba' ? indice - 1 : indice + 1
  if (destino < 0 || destino >= productos.length) {
    return { ok: true, mensaje: 'Ya estaba en el extremo' }
  }

  // Se reescribe el orden completo: evita empates y huecos.
  const reordenados = [...productos]
  const [movido] = reordenados.splice(indice, 1)
  reordenados.splice(destino, 0, movido)

  for (const [posicion, producto] of reordenados.entries()) {
    await conexion
      .update(esquema.productos)
      .set({ orden: posicion })
      .where(eq(esquema.productos.id, producto.id))
  }

  refrescarTienda()
  return { ok: true, mensaje: 'Orden actualizado' }
}

export async function eliminarProducto(id: string): Promise<ResultadoAccion> {
  await requerirAdmin()
  const conexion = baseDeDatos()

  const [fila] = await conexion
    .select({ slug: esquema.productos.slug, nombre: esquema.productos.nombre })
    .from(esquema.productos)
    .where(eq(esquema.productos.id, id))
    .limit(1)

  if (!fila) return { ok: false, error: 'No encontramos ese producto' }

  // Las variantes caen con el producto por la llave foránea en cascada.
  await conexion.delete(esquema.productos).where(eq(esquema.productos.id, id))

  refrescarTienda(fila.slug)
  return { ok: true, mensaje: `"${fila.nombre}" fue eliminado` }
}

/* ----------------------------------------------------------- variantes */

const esquemaVariante = z.object({
  tamano: z.enum(['grande', 'pequeno']),
  precio: z.coerce.number().int().min(0, 'El precio no puede ser negativo').max(10_000_000),
  pesoGramos: z.coerce.number().int().min(0).max(5000).nullable(),
  molde: z.string().trim().max(120),
  sku: z.string().trim().min(1, 'El SKU es obligatorio').max(40),
  stock: z.coerce.number().int().min(0).max(100_000).nullable(),
  disponible: z.boolean(),
})

export async function guardarVariante(
  _estadoPrevio: ResultadoAccion | null,
  datos: FormData,
): Promise<ResultadoAccion> {
  await requerirAdmin()
  const conexion = baseDeDatos()

  const id = String(datos.get('id') ?? '').trim()
  const productoId = String(datos.get('productoId') ?? '').trim()
  if (!productoId) return { ok: false, error: 'Falta el producto' }

  const pesoCrudo = String(datos.get('pesoGramos') ?? '').trim()
  const stockCrudo = String(datos.get('stock') ?? '').trim()

  const analisis = esquemaVariante.safeParse({
    tamano: datos.get('tamano'),
    precio: datos.get('precio'),
    pesoGramos: pesoCrudo === '' ? null : pesoCrudo,
    molde: datos.get('molde') ?? '',
    sku: datos.get('sku'),
    stock: stockCrudo === '' ? null : stockCrudo,
    disponible: datos.get('disponible') === 'on',
  })

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' }
  }

  const valores = analisis.data

  const [choque] = await conexion
    .select({ id: esquema.variantes.id })
    .from(esquema.variantes)
    .where(eq(esquema.variantes.sku, valores.sku))
    .limit(1)

  if (choque && choque.id !== id) {
    return { ok: false, error: `Ya hay otra presentación con el SKU "${valores.sku}"` }
  }

  const [producto] = await conexion
    .select({ slug: esquema.productos.slug })
    .from(esquema.productos)
    .where(eq(esquema.productos.id, productoId))
    .limit(1)

  const fila = {
    productoId,
    tamano: valores.tamano as Tamano,
    precio: valores.precio,
    pesoGramos: valores.pesoGramos,
    molde: valores.molde || null,
    sku: valores.sku,
    stock: valores.stock,
    disponible: valores.disponible,
  }

  try {
    if (id) {
      await conexion.update(esquema.variantes).set(fila).where(eq(esquema.variantes.id, id))
    } else {
      const [{ siguiente }] = await conexion
        .select({
          siguiente: sql<number>`coalesce(max(${esquema.variantes.orden}), -1) + 1`,
        })
        .from(esquema.variantes)
        .where(eq(esquema.variantes.productoId, productoId))

      await conexion
        .insert(esquema.variantes)
        .values({ ...fila, id: randomUUID(), orden: siguiente })
    }

    refrescarTienda(producto?.slug)
    return { ok: true, mensaje: 'Presentación guardada' }
  } catch (error) {
    console.error('[admin] no se pudo guardar la presentación', error)
    return { ok: false, error: 'No se pudo guardar la presentación' }
  }
}

export async function eliminarVariante(id: string): Promise<ResultadoAccion> {
  await requerirAdmin()
  await baseDeDatos().delete(esquema.variantes).where(eq(esquema.variantes.id, id))
  refrescarTienda()
  return { ok: true, mensaje: 'Presentación eliminada' }
}
