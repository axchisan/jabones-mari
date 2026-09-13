import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { ItemPedido, Imagen, EstadoPedido, Tamano } from '@/lib/tipos'

export const productos = pgTable('productos', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  claim: text('claim'),
  descripcion: text('descripcion'),
  modoDeUso: text('modo_de_uso'),
  advertencia: text('advertencia'),
  ingredientes: jsonb('ingredientes').$type<string[]>().notNull().default([]),
  beneficios: jsonb('beneficios').$type<string[]>().notNull().default([]),
  tipoDePiel: jsonb('tipo_de_piel').$type<string[]>().notNull().default([]),
  uso: jsonb('uso').$type<string[]>().notNull().default([]),
  aroma: text('aroma'),
  colorMarca: text('color_marca'),
  imagenes: jsonb('imagenes').$type<Imagen[]>().notNull().default([]),
  destacado: boolean('destacado').notNull().default(false),
  activo: boolean('activo').notNull().default(true),
  orden: integer('orden').notNull().default(0),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const variantes = pgTable('variantes', {
  id: text('id').primaryKey(),
  productoId: text('producto_id')
    .notNull()
    .references(() => productos.id, { onDelete: 'cascade' }),
  tamano: text('tamano').$type<Tamano>().notNull(),
  precio: integer('precio').notNull(),
  pesoGramos: integer('peso_gramos'),
  molde: text('molde'),
  sku: text('sku').notNull().unique(),
  disponible: boolean('disponible').notNull().default(true),
})

export const pedidos = pgTable('pedidos', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  clienteNombre: text('cliente_nombre').notNull(),
  telefono: text('telefono').notNull(),
  direccion: text('direccion'),
  barrio: text('barrio'),
  notas: text('notas'),
  observacionesInternas: text('observaciones_internas'),
  // Instantánea de los precios al momento del pedido: el historial no debe mutar
  // si mañana cambian las tarifas.
  items: jsonb('items').$type<ItemPedido[]>().notNull().default([]),
  subtotal: integer('subtotal').notNull(),
  domicilio: integer('domicilio').notNull().default(0),
  total: integer('total').notNull(),
  estado: text('estado').$type<EstadoPedido>().notNull().default('abierto'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const ajustes = pgTable('ajustes', {
  clave: text('clave').primaryKey(),
  valor: jsonb('valor').notNull(),
})
