# Jabones Mari

Tienda del emprendimiento de jabones artesanales **Mari · Limpieza con el alma**, en Bogotá.
Catálogo administrable, carrito y pedidos que se cierran por WhatsApp.

**Producción:** https://jabonesmari.shop

---

## Qué hay aquí

```
docs/       Planteamiento del proyecto, identidad, catálogo, prompts de IA, SEO y despliegue
brand/      Logos de la marca
material/   Fotos originales y referencias (no se publican)
web/        La aplicación
```

## Cómo levantarlo

```bash
cd web
npm install
cp .env.example .env.local   # y completa los valores
npm run db:migrate           # crea las tablas
npm run db:seed              # carga el catálogo inicial
npm run dev
```

Abre http://localhost:3000. El panel está en `/admin`.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción |
| `npm run db:generate` | Crea la migración tras cambiar el esquema |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga el catálogo inicial (no pisa lo editado) |
| `npm run db:studio` | Explorador visual de la base de datos |
| `npx tsc --noEmit` | Revisa los tipos |
| `npx eslint src` | Revisa el estilo |

## Con qué está hecho

Next.js 16 · TypeScript · Tailwind v4 · Drizzle ORM · Neon Postgres · Better Auth ·
Cloudflare R2 · Vercel.

## Cómo se publica

Cada `push` a `main` despliega a producción desde Vercel, y cada rama genera una URL de
previsualización. Antes, GitHub Actions revisa tipos, estilo y compilación.

Las migraciones de base de datos **no** corren solas: se lanzan a mano desde la pestaña
Actions → *Migraciones de base de datos*, porque un cambio de esquema puede borrar datos.

Detalles en [`docs/08-despliegue.md`](docs/08-despliegue.md).
