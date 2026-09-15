import { NextResponse } from 'next/server'
import { disponibilidadDe } from '@/lib/inventario'

/**
 * Cuántas unidades quedan de cada presentación.
 *
 * El carrito vive en el localStorage del navegador y puede llevar días ahí;
 * para entonces el inventario cambió. Con esto el carrito refresca sus topes
 * antes de que la clienta llegue a confirmar, en vez de enterarse del agotado
 * cuando ya llenó todos los datos.
 *
 * Es solo una ayuda de la interfaz: quien decide sigue siendo el servidor al
 * crear el pedido.
 */
export async function GET(peticion: Request) {
  const parametros = new URL(peticion.url).searchParams
  const ids = (parametros.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50)

  if (ids.length === 0) return NextResponse.json({ limites: {} })

  try {
    const mapa = await disponibilidadDe(ids)

    const limites: Record<string, number | null> = {}
    for (const id of ids) {
      // Una presentación que ya no está en el catálogo queda en cero.
      limites[id] = mapa.has(id) ? (mapa.get(id)!.disponibles ?? null) : 0
    }

    return NextResponse.json({ limites })
  } catch (error) {
    console.error('[disponibilidad] no se pudo consultar', error)
    return NextResponse.json({ limites: {} })
  }
}
