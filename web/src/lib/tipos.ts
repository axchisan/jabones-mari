export type Tamano = 'grande' | 'pequeno'

export type Variante = {
  id: string
  productoId: string
  tamano: Tamano
  precio: number
  pesoGramos: number | null
  molde: string
  sku: string
  stock: number | null
  /**
   * Unidades que se pueden vender ahora: el stock menos lo apartado en
   * pedidos vivos. `null` significa sin límite (presentación por encargo).
   */
  disponibles: number | null
  disponible: boolean
  orden: number
}

export type Imagen = {
  url: string
  alt: string
}

export type Producto = {
  id: string
  slug: string
  nombre: string
  claim: string
  descripcion: string
  modoDeUso: string
  advertencia: string | null
  ingredientes: string[]
  beneficios: string[]
  tipoDePiel: string[]
  uso: string[]
  aroma: string
  colorMarca: string
  imagenes: Imagen[]
  destacado: boolean
  activo: boolean
  orden: number
  creadoEn: Date | null
  variantes: Variante[]
}

export type ItemCarrito = {
  varianteId: string
  productoSlug: string
  nombre: string
  tamano: Tamano
  precio: number
  imagen: string
  cantidad: number
  /**
   * Unidades que quedaban cuando se agregó. `null` = sin control de stock.
   * Es una copia local que se refresca contra el servidor; la comprobación
   * que vale es la del servidor al crear el pedido.
   */
  limite: number | null
}

export const ESTADOS_PEDIDO = [
  'abierto',
  'confirmado',
  'en_preparacion',
  'en_camino',
  'entregado',
  'cancelado',
] as const

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  abierto: 'Abierto',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ORIGENES_PEDIDO = ['web', 'manual'] as const
export type OrigenPedido = (typeof ORIGENES_PEDIDO)[number]

export const ETIQUETA_ORIGEN: Record<OrigenPedido, string> = {
  web: 'Por la tienda',
  manual: 'Registrado a mano',
}

export type ItemPedido = {
  varianteId: string
  productoSlug: string
  nombre: string
  tamano: Tamano
  precio: number
  cantidad: number
}

export type Pedido = {
  id: string
  codigo: string
  usuarioId: string | null
  clienteNombre: string
  telefono: string
  correo: string | null
  aceptaPromociones: boolean
  origen: OrigenPedido
  direccion: string | null
  barrio: string | null
  notas: string | null
  observacionesInternas: string | null
  items: ItemPedido[]
  subtotal: number
  domicilio: number
  total: number
  estado: EstadoPedido
  creadoEn: Date
  actualizadoEn: Date
}

export const ETIQUETA_TAMANO: Record<Tamano, string> = {
  grande: 'Grande',
  pequeno: 'Pequeño',
}
