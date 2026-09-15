import { enviarCampana, contarDestinatarios } from '@/lib/notificaciones/promociones'
import { obtenerProductos } from '@/lib/catalogo'

/**
 * Envío programado de novedades.
 *
 * Lo dispara una tarea de Vercel (ver vercel.json). Va protegido con
 * CRON_SECRET: sin eso, cualquiera con la URL podría mandarle correo a toda
 * la lista.
 *
 * Solo envía si hay algo que contar. Un correo mensual sin novedad real
 * resta más de lo que suma.
 */
export async function GET(peticion: Request) {
  const secreto = process.env.CRON_SECRET
  const autorizacion = peticion.headers.get('authorization')

  if (!secreto || autorizacion !== `Bearer ${secreto}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const destinatarios = await contarDestinatarios()
  if (destinatarios === 0) {
    return Response.json({ enviado: false, motivo: 'Nadie en la lista todavía' })
  }

  const productos = await obtenerProductos()

  // Novedad de verdad: algo publicado en los últimos 35 días.
  const hace35Dias = Date.now() - 35 * 24 * 60 * 60 * 1000
  const recientes = productos.filter(
    (p) => (p.creadoEn ? p.creadoEn.getTime() : 0) >= hace35Dias,
  )

  const hayNovedad = recientes.length > 0

  const campana = hayNovedad
    ? {
        asunto:
          recientes.length === 1
            ? `Nuevo: jabón de ${recientes[0].nombre} 🦋`
            : 'Tenemos recetas nuevas 🦋',
        titulo: recientes.length === 1 ? 'Estrenamos receta' : 'Estrenamos recetas',
        cuerpo:
          recientes.length === 1
            ? `acabamos de sumar el jabón de ${recientes[0].nombre} al catálogo. Está hecho a mano, como todos.`
            : 'sumamos recetas nuevas al catálogo, todas hechas a mano en tandas pequeñas.',
        productos: recientes.map((p) => p.slug),
      }
    : {
        asunto: 'Los jabones que más nos piden 🦋',
        titulo: 'Un recordatorio con cariño',
        cuerpo:
          'seguimos haciendo jabones a mano en Bogotá. Estos son los que más nos piden por estos días, por si tu piel anda pidiendo algo.',
        productos: [],
      }

  const resultado = await enviarCampana(campana)

  console.log('[cron] novedades:', JSON.stringify(resultado))

  return Response.json({
    enviado: true,
    novedad: hayNovedad,
    asunto: campana.asunto,
    ...resultado,
  })
}
