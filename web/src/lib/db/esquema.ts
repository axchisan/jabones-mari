import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { ItemPedido, Imagen, EstadoPedido, Tamano } from '@/lib/tipos'
import { usuarios } from './esquema-auth'

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
  // null = no se lleva inventario; un número = unidades restantes
  stock: integer('stock'),
  disponible: boolean('disponible').notNull().default(true),
  orden: integer('orden').notNull().default(0),
})

export const pedidos = pgTable('pedidos', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  // Null cuando el pedido se hizo sin cuenta: el carrito nunca obliga a registrarse.
  usuarioId: text('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }),
  clienteNombre: text('cliente_nombre').notNull(),
  telefono: text('telefono').notNull(),
  // Opcional: sin correo no hay confirmación, pero tampoco se bloquea la compra.
  correo: text('correo'),
  // Consentimiento explícito para promociones, dado en este pedido.
  aceptaPromociones: boolean('acepta_promociones').notNull().default(false),
  direccion: text('direccion'),
  barrio: text('barrio'),
  notas: text('notas'),
  observacionesInternas: text('observaciones_internas'),
  // 'web' si entró por la tienda, 'manual' si lo registró la administración.
  // Sirve para saber cuánto se vende por cada canal.
  origen: text('origen').notNull().default('web'),
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

/**
 * Lista de correos con consentimiento para promociones.
 *
 * Se guarda aparte de los pedidos porque el consentimiento es de la persona,
 * no de la compra: se da una vez y se puede revocar sin tocar el historial.
 * La ley 1581 exige poder demostrar cuándo y cómo se dio, y poder retirarlo.
 */
export const suscriptoresCorreo = pgTable('suscriptores_correo', {
  id: text('id').primaryKey(),
  correo: text('correo').notNull().unique(),
  nombre: text('nombre'),
  acepta: boolean('acepta').notNull().default(true),
  // 'pedido' o 'cuenta': de dónde salió el consentimiento.
  origen: text('origen').notNull().default('pedido'),
  // Va en el enlace de baja del pie de cada correo.
  tokenBaja: text('token_baja').notNull().unique(),
  aceptadoEn: timestamp('aceptado_en', { withTimezone: true }).notNull().defaultNow(),
  revocadoEn: timestamp('revocado_en', { withTimezone: true }),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
})

export * from './esquema-auth'
