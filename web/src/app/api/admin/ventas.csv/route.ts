import { requerirAdmin } from '@/lib/auth/sesion'
import { ventasParaExportar, type Periodo } from '@/lib/admin/estadisticas'
import { fechaCorta, fechaLegible } from '@/lib/formato'
import { ETIQUETA_ESTADO, ETIQUETA_ORIGEN, ETIQUETA_TAMANO } from '@/lib/tipos'

/** Exporta las ventas del periodo para abrirlas en Excel o en Sheets. */
export async function GET(peticion: Request) {
  await requerirAdmin()

  const url = new URL(peticion.url)
  const pedidos = Number(url.searchParams.get('dias'))
  const periodo = ([7, 30, 90, 365].includes(pedidos) ? pedidos : 30) as Periodo

  const ventas = await ventasParaExportar(periodo)

  const columnas = [
    'Código',
    'Fecha',
    'Hora',
    'Estado',
    'Origen',
    'Clienta',
    'Teléfono',
    'Correo',
    'Barrio',
    'Productos',
    'Unidades',
    'Subtotal',
    'Domicilio',
    'Total',
    'Notas internas',
  ]

  /** Excel interpreta las comas: todo campo va entre comillas y con las suyas escapadas. */
  const escapar = (valor: string | number | null) =>
    `"${String(valor ?? '').replace(/"/g, '""')}"`

  const filas = ventas.map((p) => {
    const productos = p.items
      .map((i) => `${i.cantidad}x ${i.nombre} (${ETIQUETA_TAMANO[i.tamano]})`)
      .join(' · ')
    const unidades = p.items.reduce((suma, i) => suma + i.cantidad, 0)

    return [
      p.codigo,
      fechaCorta(p.creadoEn),
      fechaLegible(p.creadoEn),
      ETIQUETA_ESTADO[p.estado],
      ETIQUETA_ORIGEN[p.origen ?? 'web'],
      p.clienteNombre,
      p.telefono,
      p.correo,
      p.barrio,
      productos,
      unidades,
      p.subtotal,
      p.domicilio,
      p.total,
      p.observacionesInternas,
    ]
      .map(escapar)
      .join(',')
  })

  // El BOM hace que Excel abra las tildes bien en vez de como símbolos raros.
  const csv = '﻿' + [columnas.map(escapar).join(','), ...filas].join('\n')
  const nombre = `ventas-jabones-mari-${periodo}dias-${fechaCorta(new Date()).replace(/\//g, '-')}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
