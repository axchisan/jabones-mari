import { z } from 'zod'

/** Celular colombiano: 10 dígitos que empiezan por 3. */
const telefonoCO = z
  .string()
  .trim()
  .transform((valor) => valor.replace(/\D/g, ''))
  .refine((valor) => /^3\d{9}$/.test(valor), {
    message: 'Escribe un celular colombiano de 10 dígitos, por ejemplo 3211234567',
  })

/**
 * Una línea del carrito tal como llega del navegador.
 *
 * Solo `varianteId` y `cantidad` se toman en serio: el resto lo vuelve a leer
 * el servidor del catálogo antes de guardar nada. Lo que manda el navegador
 * se puede editar desde las herramientas del inspector, y un precio o un
 * nombre que viajan sin comprobarse son un precio y un nombre que alguien
 * puede poner a su gusto.
 */
export const itemPedidoSchema = z.object({
  varianteId: z.string().min(1),
  cantidad: z.number().int().min(1).max(99),
  // Se aceptan por compatibilidad con el carrito guardado, y se descartan.
  productoSlug: z.string().optional(),
  nombre: z.string().optional(),
  tamano: z.enum(['grande', 'pequeno']).optional(),
  precio: z.number().optional(),
})

export const datosClienteSchema = z.object({
  clienteNombre: z
    .string()
    .trim()
    .min(2, 'Escribe tu nombre')
    .max(80, 'El nombre es muy largo'),
  telefono: telefonoCO,
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email('Revisa el correo')
    .max(160)
    .optional()
    .or(z.literal('')),
  // Debe llegar sin marcar por defecto: el consentimiento se da, no se asume.
  aceptaPromociones: z.boolean().optional(),
  direccion: z
    .string()
    .trim()
    .max(160, 'La dirección es muy larga')
    .optional()
    .or(z.literal('')),
  barrio: z.string().trim().max(80).optional().or(z.literal('')),
  notas: z.string().trim().max(400, 'Las notas son muy largas').optional().or(z.literal('')),
})

export const nuevoPedidoSchema = datosClienteSchema.extend({
  items: z.array(itemPedidoSchema).min(1, 'El carrito está vacío'),
})

export type DatosCliente = z.infer<typeof datosClienteSchema>
export type NuevoPedidoEntrada = z.infer<typeof nuevoPedidoSchema>
