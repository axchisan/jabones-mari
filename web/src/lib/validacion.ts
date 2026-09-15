import { z } from 'zod'

/** Celular colombiano: 10 dígitos que empiezan por 3. */
const telefonoCO = z
  .string()
  .trim()
  .transform((valor) => valor.replace(/\D/g, ''))
  .refine((valor) => /^3\d{9}$/.test(valor), {
    message: 'Escribe un celular colombiano de 10 dígitos, por ejemplo 3211234567',
  })

export const itemPedidoSchema = z.object({
  varianteId: z.string().min(1),
  productoSlug: z.string().min(1),
  nombre: z.string().min(1),
  tamano: z.enum(['grande', 'pequeno']),
  precio: z.number().int().positive(),
  cantidad: z.number().int().min(1).max(99),
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
