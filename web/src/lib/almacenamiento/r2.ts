import 'server-only'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

/**
 * Almacenamiento de imágenes en Cloudflare R2.
 *
 * Se eligió R2 sobre Vercel Blob por dos razones concretas: el plan gratuito
 * es de 10 GB (contra 1 GB) y el tráfico de salida no se cobra nunca, que es
 * justo lo que consume una tienda llena de fotos.
 *
 * Las fotos se sirven desde la URL pública del bucket, así que la app solo
 * necesita credenciales para escribir.
 */

const cuenta = process.env.R2_ACCOUNT_ID
const clave = process.env.R2_ACCESS_KEY_ID
const secreto = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET ?? 'jabones-mari-media'

export const URL_PUBLICA = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''

/** Sin credenciales el panel sigue funcionando: solo se oculta la subida. */
export const hayAlmacenamiento = Boolean(cuenta && clave && secreto && URL_PUBLICA)

const cliente = hayAlmacenamiento
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${cuenta}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: clave!, secretAccessKey: secreto! },
    })
  : null

export const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export const TAMANO_MAXIMO = 8 * 1024 * 1024 // 8 MB

const EXTENSIONES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export type ResultadoSubida =
  | { ok: true; url: string; clave: string }
  | { ok: false; error: string }

/** Nombre legible y único: "menta-romero-a1b2c3d4.jpg". */
function nombreDeArchivo(base: string, tipo: string): string {
  const limpio = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const sufijo = randomUUID().slice(0, 8)
  return `productos/${limpio || 'foto'}-${sufijo}.${EXTENSIONES[tipo] ?? 'jpg'}`
}

export async function subirImagen(
  archivo: File,
  nombreBase: string,
): Promise<ResultadoSubida> {
  if (!cliente) {
    return { ok: false, error: 'El almacenamiento de imágenes no está configurado' }
  }

  if (!TIPOS_PERMITIDOS.includes(archivo.type as (typeof TIPOS_PERMITIDOS)[number])) {
    return { ok: false, error: 'Solo aceptamos imágenes JPG, PNG, WebP o AVIF' }
  }

  if (archivo.size > TAMANO_MAXIMO) {
    return { ok: false, error: 'La imagen pesa más de 8 MB. Redúcela e intenta de nuevo.' }
  }

  const clave = nombreDeArchivo(nombreBase, archivo.type)

  try {
    await cliente.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: clave,
        Body: Buffer.from(await archivo.arrayBuffer()),
        ContentType: archivo.type,
        // Las fotos no cambian: se pueden cachear para siempre.
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    return { ok: true, url: `${URL_PUBLICA}/${clave}`, clave }
  } catch (error) {
    console.error('[r2] no se pudo subir la imagen', error)
    return { ok: false, error: 'No se pudo subir la imagen. Intenta de nuevo.' }
  }
}

export async function borrarImagen(clave: string): Promise<boolean> {
  if (!cliente) return false

  try {
    await cliente.send(new DeleteObjectCommand({ Bucket: bucket, Key: clave }))
    return true
  } catch (error) {
    console.error('[r2] no se pudo borrar la imagen', error)
    return false
  }
}
