/**
 * Crea la ficha del jabón de Carbón Activado y Té.
 *
 * Nace OCULTO a propósito: todavía no tiene foto, y un producto sin imagen
 * en la tienda se ve peor que uno que no está. Se publica desde el panel en
 * cuanto se le suba la foto.
 *
 *   npm run db:carbon
 */
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'node:crypto'

const sql = neon(process.env.DATABASE_URL)

const producto = {
  id: 'carbon-te',
  slug: 'carbon-te',
  nombre: 'Carbón Activado y Té',
  claim: 'Limpieza profunda',
  descripcion:
    'El que pide la piel que se satura. El carbón activado atrae y arrastra lo que se acumula en el poro durante el día, y las hojas de té verde calman lo que esa limpieza podría alterar. Uno saca, el otro cuida: por eso funcionan juntos y no por separado.',
  modoDeUso:
    'Aplica sobre el rostro húmedo con movimientos circulares, deja actuar un minuto y enjuaga con agua tibia. Dos o tres veces por semana es suficiente.',
  advertencia:
    'El carbón puede manchar toallas y ropa clara mientras está húmedo. Enjuaga bien el lavamanos después de usarlo.',
  ingredientes: [
    'Base de glicerina vegetal',
    'Carbón activado',
    'Hojas de té verde',
  ],
  beneficios: [
    'Limpieza profunda',
    'Absorbe el exceso de grasa',
    'Purifica los poros',
    'Antioxidante natural',
    'Ayuda a calmar la rojez',
    'Refresca sin resecar',
  ],
  tipoDePiel: ['Grasa', 'Mixta'],
  uso: ['Facial'],
  aroma: 'Herbal suave, con fondo terroso',
  colorMarca: '#3D4A42',
  imagenes: [],
  destacado: false,
  activo: false,
  orden: 7,
}

const variantes = [
  { tamano: 'grande', precio: 7500, sku: 'CARTE-G', molde: 'Corazón, óvalo o flor, según disponibilidad', orden: 0 },
  { tamano: 'pequeno', precio: 5000, sku: 'CARTE-P', molde: 'Redondo', orden: 1 },
]

const [existente] = await sql`SELECT id FROM productos WHERE id = ${producto.id} OR slug = ${producto.slug}`

if (existente) {
  console.log('Ya existe un producto con ese identificador. No se toca nada.')
  process.exit(0)
}

await sql`
  INSERT INTO productos (
    id, slug, nombre, claim, descripcion, modo_de_uso, advertencia,
    ingredientes, beneficios, tipo_de_piel, uso, aroma, color_marca,
    imagenes, destacado, activo, orden
  ) VALUES (
    ${producto.id}, ${producto.slug}, ${producto.nombre}, ${producto.claim},
    ${producto.descripcion}, ${producto.modoDeUso}, ${producto.advertencia},
    ${JSON.stringify(producto.ingredientes)}::jsonb,
    ${JSON.stringify(producto.beneficios)}::jsonb,
    ${JSON.stringify(producto.tipoDePiel)}::jsonb,
    ${JSON.stringify(producto.uso)}::jsonb,
    ${producto.aroma}, ${producto.colorMarca},
    ${JSON.stringify(producto.imagenes)}::jsonb,
    ${producto.destacado}, ${producto.activo}, ${producto.orden}
  )`

for (const v of variantes) {
  await sql`
    INSERT INTO variantes (id, producto_id, tamano, precio, molde, sku, disponible, orden)
    VALUES (${randomUUID()}, ${producto.id}, ${v.tamano}, ${v.precio}, ${v.molde}, ${v.sku}, true, ${v.orden})`
}

console.log(`Creado: ${producto.nombre} (oculto, con ${variantes.length} presentaciones)`)
console.log('Súbele la foto desde el panel y márcalo como visible para publicarlo.')
