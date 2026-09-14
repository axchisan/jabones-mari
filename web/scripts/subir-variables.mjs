/**
 * Sube a Vercel las variables de entorno de producción.
 *
 * Lee los valores de .env.local y los complementa con los de producción
 * (el dominio real, R2). Nunca imprime los valores: solo dice qué subió.
 *
 *   node scripts/subir-variables.mjs
 *   node scripts/subir-variables.mjs --entorno preview
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const entorno = process.argv.includes('--entorno')
  ? process.argv[process.argv.indexOf('--entorno') + 1]
  : 'production'

const SITIO = 'https://jabonesmari.shop'

function leerEnvLocal() {
  const valores = {}
  try {
    for (const linea of readFileSync('.env.local', 'utf8').split('\n')) {
      const limpia = linea.trim()
      if (!limpia || limpia.startsWith('#')) continue
      const separador = limpia.indexOf('=')
      if (separador === -1) continue
      valores[limpia.slice(0, separador)] = limpia.slice(separador + 1)
    }
  } catch {
    console.error('No se encontró .env.local')
    process.exit(1)
  }
  return valores
}

const local = leerEnvLocal()

// Lo que va a producción. Las variables sin valor se omiten con un aviso.
const variables = {
  DATABASE_URL: local.DATABASE_URL,
  BETTER_AUTH_SECRET: local.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: SITIO,
  NEXT_PUBLIC_SITE_URL: SITIO,
  NEXT_PUBLIC_WHATSAPP_NUMBER: local.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573212881565',
  R2_ACCOUNT_ID: local.R2_ACCOUNT_ID ?? '0f7b42c155f51aa530226c3de9b9e583',
  R2_BUCKET: local.R2_BUCKET ?? 'jabones-mari-media',
  NEXT_PUBLIC_R2_PUBLIC_URL:
    local.NEXT_PUBLIC_R2_PUBLIC_URL ??
    'https://pub-b72dc903052b4dc594126e2f2b0799bb.r2.dev',
  R2_ACCESS_KEY_ID: local.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: local.R2_SECRET_ACCESS_KEY,
  RESEND_API_KEY: local.RESEND_API_KEY,
  RESEND_FROM: local.RESEND_FROM,
  NOTIFICAR_A: local.NOTIFICAR_A,
  VAPID_PUBLIC_KEY: local.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: local.VAPID_PRIVATE_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: local.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_SUBJECT: local.VAPID_SUBJECT,
  GOOGLE_SITE_VERIFICATION: local.GOOGLE_SITE_VERIFICATION,
  GOOGLE_CLIENT_ID: local.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: local.GOOGLE_CLIENT_SECRET,
}

const subidas = []
const omitidas = []

for (const [nombre, valor] of Object.entries(variables)) {
  if (!valor) {
    omitidas.push(nombre)
    continue
  }

  // Las NEXT_PUBLIC_ acaban en el HTML de todos modos: guardarlas como
  // configuración permite leerlas después con `vercel env pull`.
  const tipo = nombre.startsWith('NEXT_PUBLIC_') ? 'config' : 'secret'

  try {
    execFileSync(
      'npx',
      ['vercel', 'env', 'add', nombre, entorno, '--force', '--type', tipo],
      { input: valor, stdio: ['pipe', 'pipe', 'pipe'] },
    )
    subidas.push(nombre)
  } catch (error) {
    const detalle = String(error.stderr ?? error.message).trim().split('\n').pop()
    console.error(`  ✗ ${nombre}: ${detalle}`)
  }
}

console.log(`\nEntorno: ${entorno}`)
console.log(`Subidas (${subidas.length}): ${subidas.join(', ')}`)
if (omitidas.length > 0) {
  console.log(`\nSin valor todavía (${omitidas.length}): ${omitidas.join(', ')}`)
  console.log('Complétalas en .env.local y vuelve a correr este script.')
}
