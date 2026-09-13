import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as esquema from './esquema'

const url = process.env.DATABASE_URL

/** true cuando hay Postgres conectado; false mientras se desarrolla sin base. */
export const hayBaseDeDatos = Boolean(url)

export const db = url ? drizzle(neon(url), { schema: esquema }) : null

export { esquema }
