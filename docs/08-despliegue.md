# Despliegue y puesta en producción

Todo lo que hay que hacer para que `jabonesmari.shop` esté en línea, y cómo
mantenerlo después.

---

## 1. Cómo está montado

```
GitHub (repo privado)
   │  cada push a main
   ▼
GitHub Actions ──► revisa tipos, estilo y compilación
   │
   ▼
Vercel ──► compila y publica
   │         · main            → producción (jabonesmari.shop)
   │         · cualquier rama  → URL de previsualización
   ▼
Neon Postgres (datos) · Cloudflare R2 (fotos)
```

**Las migraciones de base de datos no corren solas.** Un cambio de esquema puede borrar
datos, así que se lanzan a mano desde *Actions → Migraciones de base de datos*, escribiendo
`aplicar` para confirmar. Queda registrado quién lo hizo y cuándo.

---

## 2. Por qué Cloudflare R2 y no Vercel Blob

Los dos funcionan. R2 gana en este caso concreto:

| | Cloudflare R2 | Vercel Blob |
|---|---|---|
| Almacenamiento gratis | **10 GB** | 1 GB |
| Tráfico de salida | **$0, siempre** | Se cuenta y se cobra al pasarse |
| Operaciones gratis | 1 M escrituras + 10 M lecturas al mes | Incluidas en el plan |
| Cuenta | **Ya existía** | Habría que activarla |
| API | S3 estándar (portable a cualquier proveedor) | Propia de Vercel |

Una tienda es casi toda imágenes, así que **el tráfico de salida es el costo que importa**,
y en R2 no existe. Con 10 GB caben miles de fotos de producto: hoy el catálogo entero pesa
2,3 MB.

Y al ser API de S3, si algún día hay que mudarse a otro proveedor, se cambia el endpoint y
ya — no hay que reescribir el código.

**Lo que ya está hecho:** el bucket `jabones-mari-media` está creado y con acceso público en
`https://pub-b72dc903052b4dc594126e2f2b0799bb.r2.dev`. Falta generar las credenciales de
escritura (paso 4).

---

## 3. Subir el código a GitHub

```bash
cd /Users/mac/Documents/Dev/Apps/JabonesMari
gh repo create jabones-mari --private --source=. --push
```

Privado, porque el repositorio incluye la lógica del negocio. Las contraseñas y llaves
nunca están en el código: viven en variables de entorno.

---

## 4. Generar las credenciales de R2

Wrangler no puede crear estas llaves; hay que hacerlo en el panel. Son 2 minutos.

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**.
2. A la derecha, **API** → **Manage API tokens** → **Create API token**.
3. Configúralo así:

   | Campo | Valor |
   |---|---|
   | Nombre | `jabones-mari-escritura` |
   | Permisos | **Object Read & Write** |
   | Buckets | Solo `jabones-mari-media` |
   | Caducidad | Sin vencimiento |

4. **Create**. Copia los tres valores que aparecen:
   - **Access Key ID**
   - **Secret Access Key** (solo se muestra una vez)
   - El **Account ID** está en la barra lateral de R2

> ⚠️ Dale acceso **solo** a `jabones-mari-media`. El otro bucket, `axchisan-media`, es del
> portafolio y no tiene por qué quedar expuesto.

---

## 5. Crear el proyecto en Vercel

```bash
cd web
npx vercel link --yes --project jabones-mari
```

> ⚠️ **El paso que se olvida.** Vercel crea el proyecto apuntando a la raíz del
> repositorio, pero aquí la aplicación vive en `web/`. Sin corregirlo, los despliegues
> terminan en 0 ms sin compilar nada y sin dejar ningún log que lo explique.
>
> El CLI no tiene comando para cambiarlo. Se corrige con:
>
> ```bash
> node scripts/ajustar-proyecto-vercel.mjs
> ```
>
> o a mano en Vercel → *Settings* → *Build & Deployment* → **Root Directory** → `web`.

---

## 6. Variables de entorno en producción

En Vercel → *Settings* → *Environment Variables*, para el entorno **Production**:

| Variable | De dónde sale |
|---|---|
| `DATABASE_URL` | Neon → proyecto JabonesMari → Connection string |
| `BETTER_AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `BETTER_AUTH_URL` | `https://jabonesmari.shop` |
| `NEXT_PUBLIC_SITE_URL` | `https://jabonesmari.shop` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573212881565` |
| `R2_ACCOUNT_ID` | Panel de R2 (paso 4) |
| `R2_ACCESS_KEY_ID` | Paso 4 |
| `R2_SECRET_ACCESS_KEY` | Paso 4 |
| `R2_BUCKET` | `jabones-mari-media` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | `https://pub-b72dc903052b4dc594126e2f2b0799bb.r2.dev` |
| `GOOGLE_CLIENT_ID` | Opcional, ver `07-google-oauth.md` |
| `GOOGLE_CLIENT_SECRET` | Opcional, ver `07-google-oauth.md` |

O de una vez, leyendo de `.env.local` y completando los valores de producción:

```bash
cd web
node scripts/subir-variables.mjs
```

El script nunca imprime los valores: solo dice cuáles subió y cuáles siguen sin definir.

**En GitHub** hace falta además un secreto para el workflow de migraciones:

```bash
gh secret set DATABASE_URL --repo axchisan/jabones-mari
```

---

## 7. Conectar el dominio

`jabonesmari.shop` está registrado en Hostinger y hoy apunta a los servidores de parqueo
(`dns-parking.com`). Hay dos caminos:

Los dos dominios ya están dados de alta en el proyecto (`jabonesmari.shop` y
`www.jabonesmari.shop`). Falta apuntar el DNS, y eso se hace en Hostinger.

### Opción A — Registros DNS en Hostinger (la que recomienda Vercel)

En Hostinger → *Dominios* → `jabonesmari.shop` → **DNS / Nameservers** →
*Administrar registros DNS*:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Deja intactos los registros `MX` si algún día quieres correo propio en el dominio.

### Opción B — Nameservers a Vercel

En Hostinger, cambia los nameservers de parqueo por:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Vercel pasa a gestionar todo el DNS del dominio. Más cómodo, pero si luego quieres correo
propio hay que recrear los registros `MX` dentro de Vercel.

> **Recomendación:** la opción A. Es la que sugiere Vercel, no toca el resto del DNS y deja
> la puerta abierta al correo en Hostinger.

Para ver en cualquier momento qué falta:

```bash
cd web && npx vercel domains inspect jabonesmari.shop
```

La propagación tarda de minutos a 24 horas. El certificado HTTPS se emite solo.

---

## 8. Desplegar

El camino normal es **hacer push**: Vercel compila y publica solo.

```bash
git push origin main
```

> ⚠️ **No lances `npx vercel --prod` desde dentro de `web/`.** Falla con
> *"The specified Root Directory 'web' does not exist"*, porque sube esa carpeta como raíz
> y luego busca `web/` dentro de ella. Si hace falta desplegar a mano, hazlo desde la raíz
> del repositorio.

> ⚠️ **Los commits deben ir firmados con un correo de la cuenta de GitHub** (aquí,
> `leftyrancuentabot@gmail.com`). Si no, Vercel los bloquea con *"couldn't find a Git account
> for the commit author"* y los despliegues quedan en estado `UNKNOWN`, con un build de 0 ms
> y sin ningún log que lo explique. El motivo real solo se ve consultando la API:
>
> ```bash
> curl -s -H "Authorization: Bearer $TOKEN" \
>   "https://api.vercel.com/v6/deployments?projectId=$ID&limit=3" | jq '.deployments[].errorMessage'
> ```

**Justo después del primer despliegue:**

1. Aplica las migraciones (Actions → *Migraciones de base de datos* → `aplicar`).
2. Crea la cuenta de administración:
   ```bash
   BETTER_AUTH_URL=https://jabonesmari.shop \
   DATABASE_URL='...' \
   node web/scripts/crear-admin.mjs correo@ejemplo.com "una-contraseña-buena" "Tu nombre"
   ```
3. Entra a `https://jabonesmari.shop/admin` y **cambia la contraseña temporal**.
4. Carga el catálogo: `npm run db:seed` apuntando a la base de producción, o crea los
   productos desde el panel.

---

## 9. Lista de verificación antes de anunciar el sitio

- [ ] La tienda abre en `https://jabonesmari.shop` con candado.
- [ ] `www.jabonesmari.shop` redirige al dominio sin `www`.
- [ ] El catálogo muestra los productos con sus fotos.
- [ ] Un pedido de prueba llega completo al WhatsApp del negocio.
- [ ] El pedido de prueba aparece en `/admin/pedidos` (y luego se borra).
- [ ] El panel exige contraseña y rechaza a quien no sea administradora.
- [ ] Subir una foto desde el panel funciona y se ve en la tienda.
- [ ] La página se instala como app desde el celular.
- [ ] `https://jabonesmari.shop/sitemap.xml` responde con todas las páginas.
- [ ] `https://jabonesmari.shop/robots.txt` bloquea `/admin`.
- [ ] Los datos estructurados pasan
      [el validador de Google](https://search.google.com/test/rich-results).
- [ ] Lighthouse en móvil por encima de 90.
- [ ] La política de privacidad y los términos están enlazados en el pie.

---

## 10. Después de publicar

1. **Google Search Console** — verifica el dominio y envía el sitemap.
2. **Google Business Profile** — crea la ficha con área de servicio en Bogotá. Para un
   negocio local pesa más que el propio sitio web.
3. **Instagram** — enlace en la biografía.
4. **QR en la etiqueta** del producto, apuntando a `jabonesmari.shop`.
5. Pide reseña a las clientas que ya compraron.

---

## 11. Costo mensual

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby | $0 |
| Neon | Free | $0 |
| Cloudflare R2 | Free (10 GB) | $0 |
| GitHub | Free (privado) | $0 |
| Dominio `.shop` | Anual, ya pagado | Renovación automática |

Lo único que se paga es el dominio. Todo lo demás aguanta de sobra el tráfico de un
emprendimiento que empieza.

---

## 12. Si algo falla

| Síntoma | Dónde mirar |
|---|---|
| El despliegue falla | Vercel → *Deployments* → el log del build |
| La tienda carga sin productos | `DATABASE_URL` en Vercel; que las migraciones se hayan aplicado |
| No deja entrar al panel | `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL` en producción |
| El botón de Google no aparece | Faltan `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` |
| Las fotos nuevas no suben | Las cuatro variables `R2_*`, y que el token tenga permiso de escritura |
| Las fotos suben pero no se ven | `NEXT_PUBLIC_R2_PUBLIC_URL` y el acceso público del bucket |
| Sale error de dominio | Aún propagando; comprueba con `dig jabonesmari.shop` |

Los registros en vivo: `npx vercel logs <url-del-despliegue>`.
