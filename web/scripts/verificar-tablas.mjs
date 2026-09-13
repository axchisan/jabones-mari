import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)
const filas = await sql`
  SELECT table_name, (SELECT count(*) FROM information_schema.columns c
    WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columnas
  FROM information_schema.tables t
  WHERE table_schema = 'public' ORDER BY table_name`
for (const f of filas) console.log(`${f.table_name.padEnd(20)} ${f.columnas} columnas`)
