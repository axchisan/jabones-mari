/**
 * Carga el catálogo inicial en la base de datos.
 *
 * Es idempotente: se puede correr varias veces sin duplicar. Solo inserta
 * lo que falta y nunca pisa cambios hechos desde el panel, salvo que se
 * ejecute con --forzar.
 *
 *   npm run db:seed
 *   npm run db:seed -- --forzar
 */
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import * as esquema from '../src/lib/db/esquema.ts'
import { PRODUCTOS_SEMILLA } from '../src/content/productos.ts'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Revisa .env.local')
  process.exit(1)
}

const forzar = process.argv.includes('--forzar')
const db = drizzle(neon(url), { schema: esquema })

async function sembrar() {
  console.log(forzar ? 'Sembrando (sobrescribiendo)…' : 'Sembrando lo que falte…')

  let creados = 0
  let omitidos = 0

  for (const producto of PRODUCTOS_SEMILLA) {
    const [existente] = await db
      .select({ id: esquema.productos.id })
      .from(esquema.productos)
      .where(eq(esquema.productos.id, producto.id))
      .limit(1)

    if (existente && !forzar) {
      omitidos += 1
      continue
    }

    const fila = {
      id: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      claim: producto.claim,
      descripcion: producto.descripcion,
      modoDeUso: producto.modoDeUso,
      advertencia: producto.advertencia,
      ingredientes: producto.ingredientes,
      beneficios: producto.beneficios,
      tipoDePiel: producto.tipoDePiel,
      uso: producto.uso,
      aroma: producto.aroma,
      colorMarca: producto.colorMarca,
      imagenes: producto.imagenes,
      destacado: producto.destacado,
      activo: producto.activo,
      orden: producto.orden,
      actualizadoEn: new Date(),
    }

    if (existente) {
      await db.update(esquema.productos).set(fila).where(eq(esquema.productos.id, producto.id))
    } else {
      await db.insert(esquema.productos).values(fila)
    }

    for (const [indice, variante] of producto.variantes.entries()) {
      const filaVariante = {
        id: variante.id,
        productoId: producto.id,
        tamano: variante.tamano,
        precio: variante.precio,
        pesoGramos: variante.pesoGramos,
        molde: variante.molde,
        sku: variante.sku,
        stock: null,
        disponible: variante.disponible,
        orden: indice,
      }

      const [varianteExistente] = await db
        .select({ id: esquema.variantes.id })
        .from(esquema.variantes)
        .where(eq(esquema.variantes.id, variante.id))
        .limit(1)

      if (varianteExistente) {
        await db
          .update(esquema.variantes)
          .set(filaVariante)
          .where(eq(esquema.variantes.id, variante.id))
      } else {
        await db.insert(esquema.variantes).values(filaVariante)
      }
    }

    creados += 1
    console.log(`  · ${producto.nombre}`)
  }

  console.log(`\nListo. ${creados} producto(s) escritos, ${omitidos} sin tocar.`)
}

sembrar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Falló la siembra:', error)
    process.exit(1)
  })
