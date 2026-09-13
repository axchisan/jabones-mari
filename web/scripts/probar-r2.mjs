/** Comprueba que las credenciales de R2 sirven para escribir, leer y borrar. */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const cliente = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const bucket = process.env.R2_BUCKET
const clave = `pruebas/conexion-${Date.now()}.txt`
const publico = process.env.NEXT_PUBLIC_R2_PUBLIC_URL

await cliente.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: clave,
    Body: 'prueba de conexión de Jabones Mari',
    ContentType: 'text/plain',
  }),
)
console.log('1. Escritura        ok')

const url = `${publico}/${clave}`
const respuesta = await fetch(url)
console.log(`2. Lectura pública  ${respuesta.ok ? 'ok' : 'FALLÓ (HTTP ' + respuesta.status + ')'}`)
if (respuesta.ok) console.log(`   contenido: "${(await respuesta.text()).slice(0, 40)}"`)

await cliente.send(new DeleteObjectCommand({ Bucket: bucket, Key: clave }))
console.log('3. Borrado          ok')
console.log('\nR2 quedó operativo.')
