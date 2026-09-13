/**
 * Ajusta la configuración del proyecto en Vercel.
 *
 * El repositorio guarda la aplicación en `web/`, pero Vercel crea los
 * proyectos apuntando a la raíz. Sin corregirlo, los despliegues desde
 * GitHub no encuentran nada que compilar.
 *
 * No existe comando de CLI para esto, así que se usa la API con la sesión
 * que el propio CLI ya tiene abierta. El token nunca se imprime.
 *
 *   node scripts/ajustar-proyecto-vercel.mjs
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const RAIZ = 'web'

/**
 * La tienda es pública, así que producción no puede quedar detrás del SSO
 * de Vercel. Las previsualizaciones sí se protegen: son borradores y no
 * deberían ser visitables ni indexables por cualquiera.
 */
const PROTECCION = { deploymentType: 'preview' }

function leerSesionDelCli() {
  const base = path.join(
    homedir(),
    'Library',
    'Application Support',
    'com.vercel.cli',
    'auth.json',
  )

  try {
    const { token } = JSON.parse(readFileSync(base, 'utf8'))
    if (!token) throw new Error('sin token')
    return token
  } catch {
    console.error(
      'No se encontró la sesión del CLI de Vercel. Ejecuta `npx vercel login` primero.',
    )
    process.exit(1)
  }
}

function leerProyecto() {
  try {
    return JSON.parse(readFileSync('.vercel/project.json', 'utf8'))
  } catch {
    console.error('Falta .vercel/project.json. Ejecuta `npx vercel link` primero.')
    process.exit(1)
  }
}

const token = process.env.VERCEL_TOKEN ?? leerSesionDelCli()
const { projectId, orgId } = leerProyecto()

const url = `https://api.vercel.com/v9/projects/${projectId}?teamId=${orgId}`

const respuesta = await fetch(url, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ rootDirectory: RAIZ, ssoProtection: PROTECCION }),
})

if (!respuesta.ok) {
  console.error(`No se pudo ajustar el proyecto (HTTP ${respuesta.status})`)
  console.error(await respuesta.text())
  process.exit(1)
}

const proyecto = await respuesta.json()

console.log(`Proyecto:        ${proyecto.name}`)
console.log(`Root Directory:  ${proyecto.rootDirectory ?? '.'}`)
console.log(`Framework:       ${proyecto.framework ?? '(sin definir)'}`)
console.log(
  `Protección SSO:  ${proyecto.ssoProtection?.deploymentType ?? 'ninguna'} ` +
    '(producción queda pública)',
)
console.log('\nListo. El próximo despliegue ya compilará desde esa carpeta.')
