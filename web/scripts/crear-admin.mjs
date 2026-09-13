/**
 * Crea (o promueve) una cuenta de administrador.
 *
 *   node scripts/crear-admin.mjs correo@ejemplo.com "Contraseña" "Nombre"
 *
 * Usa el propio endpoint de registro para que la contraseña quede hasheada
 * por Better Auth, y luego eleva el rol a 'admin' en la base.
 */
import { neon } from '@neondatabase/serverless'

const [correo, contrasena, nombre = 'Administración'] = process.argv.slice(2)
const base = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

if (!correo || !contrasena) {
  console.error('Uso: node scripts/crear-admin.mjs <correo> <contraseña> [nombre]')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const [existente] = await sql`SELECT id, role FROM "user" WHERE email = ${correo}`

if (existente) {
  await sql`UPDATE "user" SET role = 'admin', updated_at = now() WHERE id = ${existente.id}`
  console.log(`La cuenta ${correo} ya existía. Rol actualizado a admin.`)
} else {
  const respuesta = await fetch(`${base}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ email: correo, password: contrasena, name: nombre }),
  })

  if (!respuesta.ok) {
    console.error('No se pudo registrar:', respuesta.status, await respuesta.text())
    process.exit(1)
  }

  await sql`UPDATE "user" SET role = 'admin', email_verified = true, updated_at = now() WHERE email = ${correo}`
  console.log(`Cuenta de administrador creada: ${correo}`)
}

const filas = await sql`SELECT email, role FROM "user" ORDER BY created_at`
console.log('\nUsuarios registrados:')
for (const f of filas) console.log(`  ${f.role.padEnd(8)} ${f.email}`)
