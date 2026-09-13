# Arquitectura técnica

## 1. Stack elegido

| Capa | Tecnología | Por qué esta y no otra |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | Renderizado en servidor = SEO real (un catálogo hecho en React puro no lo indexa bien Google). Optimización automática de imágenes, que aquí es crítico porque el sitio es 80% fotos. |
| Estilos | **Tailwind CSS v4** | Sistema de tokens de color y tipografía en un solo archivo; cambiar la paleta de marca es cambiar 12 variables. |
| Componentes | **shadcn/ui** | Componentes accesibles que se copian al repo y se re-estilizan con nuestra paleta. No es una librería que imponga su look. |
| Base de datos | **Neon Postgres** (integración de Vercel Marketplace, free tier) | Postgres de verdad, gratis, con *scale-to-zero*: no cobra cuando nadie visita. Se conecta a Vercel con variables de entorno automáticas. |
| ORM | **Drizzle ORM** | Ligero, tipado, migraciones en SQL legible. Prisma también sirve; Drizzle arranca más rápido en funciones serverless. |
| Imágenes del catálogo | `web/public/productos/` + `next/image` | Son ~20 imágenes fijas generadas con IA. Servirlas desde el repo es gratis, instantáneo y versionado. |
| Imágenes subidas desde el panel | **Vercel Blob** | Cuando la prima suba una foto nueva desde el celular, va a Blob y queda con URL pública. |
| Estado del carrito | **Zustand + localStorage** | El carrito vive en el navegador de la clienta. Cero servidor, cero costo, sobrevive a cerrar la pestaña. |
| Autenticación del panel | Cookie de sesión firmada + contraseña con `bcrypt` | Son 1–2 personas. Meter Clerk/Auth0 aquí es sobre-ingeniería. Migrable después sin tocar el resto. |
| Formularios | React Hook Form + Zod | Validación del teléfono y la dirección antes de armar el mensaje de WhatsApp. |
| App móvil | **PWA instalable** | Ver sección 6. |
| Hosting | **Vercel Hobby** | Gratis, deploy automático desde GitHub, HTTPS, CDN global, previews por rama. |
| Analítica | Vercel Web Analytics | Incluida en Hobby, sin cookies, sin banner de consentimiento. |

### Sobre Shopify / plataformas de e-commerce
Shopify o similares resuelven catálogo + carrito + pago de una vez, pero cuestan desde ~USD 29/mes y obligan a vender dentro de su plantilla. Con el requisito de **costo cero** y **sin pasarela de pago** (los pedidos se cierran por WhatsApp, que es como ya vende el negocio hoy), no aplica. Queda como opción para la fase en que haya volumen suficiente y se quiera cobrar en línea.

---

## 2. Estructura del repositorio

```
JabonesMari/
├── docs/                       # Este planteamiento
├── brand/
│   ├── logo/                   # Logo definitivo (JPEG + SVG cuando se vectorice)
│   └── fotos-originales/       # Fotos caseras (referencia para la IA)
├── Catalogo de Jabones/        # Material original, intacto
├── Logos/                      # Material original, intacto
├── Referencias de otro emprendimiento/
└── web/                        # La aplicación Next.js
    ├── src/
    │   ├── app/
    │   │   ├── (tienda)/
    │   │   │   ├── page.tsx                 # Home
    │   │   │   ├── catalogo/page.tsx        # Catálogo con filtros
    │   │   │   ├── producto/[slug]/page.tsx # Ficha de producto
    │   │   │   ├── carrito/page.tsx
    │   │   │   ├── pedido/page.tsx          # Checkout → WhatsApp
    │   │   │   ├── nosotros/page.tsx
    │   │   │   └── contacto/page.tsx
    │   │   ├── admin/
    │   │   │   ├── login/page.tsx
    │   │   │   ├── page.tsx                 # Dashboard
    │   │   │   ├── productos/               # CRUD
    │   │   │   └── pedidos/                 # Bandeja de pedidos
    │   │   ├── api/
    │   │   │   ├── pedidos/route.ts
    │   │   │   └── upload/route.ts
    │   │   ├── sitemap.ts
    │   │   ├── robots.ts
    │   │   └── manifest.ts
    │   ├── components/
    │   ├── lib/
    │   │   ├── db/            # Drizzle: schema, cliente, migraciones
    │   │   ├── whatsapp.ts    # Construcción del mensaje
    │   │   ├── cart.ts        # Store de Zustand
    │   │   └── seo.ts         # JSON-LD
    │   └── content/
    │       └── productos.seed.ts   # Datos iniciales de los 6 jabones
    └── public/
        ├── productos/         # Fotos finales generadas
        ├── folletos/          # Piezas para redes
        └── icons/             # Íconos de la PWA
```

---

## 3. Modelo de datos

```sql
-- Productos
CREATE TABLE productos (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  nombre        TEXT NOT NULL,
  claim         TEXT,
  descripcion   TEXT,
  modo_de_uso   TEXT,
  advertencia   TEXT,
  ingredientes  JSONB NOT NULL DEFAULT '[]',
  beneficios    JSONB NOT NULL DEFAULT '[]',
  tipo_de_piel  JSONB NOT NULL DEFAULT '[]',
  uso           JSONB NOT NULL DEFAULT '[]',
  aroma         TEXT,
  color_marca   TEXT,
  imagenes      JSONB NOT NULL DEFAULT '[]',
  destacado     BOOLEAN NOT NULL DEFAULT false,
  activo        BOOLEAN NOT NULL DEFAULT true,
  orden         INTEGER NOT NULL DEFAULT 0,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Variantes (tamaños)
CREATE TABLE variantes (
  id           TEXT PRIMARY KEY,
  producto_id  TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tamano       TEXT NOT NULL,          -- 'grande' | 'pequeno'
  precio       INTEGER NOT NULL,       -- COP entero: 7500
  peso_gramos  INTEGER,
  molde        TEXT,
  sku          TEXT UNIQUE NOT NULL,
  disponible   BOOLEAN NOT NULL DEFAULT true
);

-- Pedidos
CREATE TABLE pedidos (
  id             TEXT PRIMARY KEY,
  codigo         TEXT UNIQUE NOT NULL,   -- 'MARI-0042', el que se menciona en WhatsApp
  cliente_nombre TEXT NOT NULL,
  telefono       TEXT NOT NULL,
  direccion      TEXT NOT NULL,
  barrio         TEXT,
  localidad      TEXT,
  notas          TEXT,
  items          JSONB NOT NULL,          -- snapshot: nombre, tamaño, precio, cantidad
  subtotal       INTEGER NOT NULL,
  domicilio      INTEGER NOT NULL DEFAULT 0,
  total          INTEGER NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'nuevo', -- nuevo|confirmado|en_camino|entregado|cancelado
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuración editable desde el panel (WhatsApp, domicilios, aviso de banner)
CREATE TABLE ajustes (
  clave  TEXT PRIMARY KEY,
  valor  JSONB NOT NULL
);
```

**Por qué `items` es un snapshot JSONB:** si mañana suben el precio del jabón grande a $8.000, los pedidos viejos deben seguir mostrando $7.500. Guardar solo el `variante_id` haría que el historial mutara.

---

## 4. Flujo del pedido (el corazón del negocio)

```
Catálogo → [Agregar al carrito] → Carrito (localStorage)
   → Formulario de pedido: nombre · teléfono · dirección · barrio/localidad · notas
   → POST /api/pedidos  →  se guarda en Postgres, se genera código MARI-0042
   → Redirección a https://wa.me/57XXXXXXXXXX?text=<mensaje URL-encoded>
   → WhatsApp abre con el pedido escrito. La dueña solo confirma y coordina la entrega.
```

**Mensaje que llega a WhatsApp:**

```
¡Hola Mari! 🦋 Quiero hacer este pedido:

*Pedido MARI-0042*

• 2 × Menta y Romero (Grande) — $15.000
• 1 × Cúrcuma y Miel (Pequeño) — $5.000
• 1 × Naranja y Coco (Grande) — $7.500

Subtotal: $27.500

*Mis datos*
Nombre: Laura Gómez
Teléfono: 310 555 1234
Dirección: Calle 134 #58-20, Apto 302
Barrio: Cedritos (Usaquén)
Notas: Prefiero entrega el sábado en la tarde

Confirmado desde jabonesmari.vercel.app
```

**Decisiones importantes de este flujo:**
- **Se guarda el pedido antes de abrir WhatsApp.** Si la clienta se arrepiente o WhatsApp no abre, el pedido igual queda registrado en el panel. Hoy esos pedidos se pierden.
- **El código `MARI-0042`** le da profesionalismo y permite rastrear la conversación.
- **El botón debe abrirse en la misma pestaña en móvil** (`window.location.href`), porque los bloqueadores de pop-ups matan `window.open` en iOS.
- **El teléfono se valida** con formato colombiano (10 dígitos empezando en 3) antes de permitir enviar.
- **Límite de caracteres:** `wa.me` soporta URLs largas, pero si el pedido pasa de ~15 ítems se resume y se remite al código del pedido.

---

## 5. Panel de administración

Ruta `/admin`, protegida por middleware. Pensado **para usarse desde el celular**, no desde un escritorio: la prima va a actualizar precios sentada en el bus.

| Pantalla | Qué permite |
|---|---|
| Login | Contraseña única del negocio. Sesión de 30 días. |
| Dashboard | Pedidos nuevos sin atender, producto más pedido, total del mes. |
| Productos | Lista arrastrable para reordenar. Botón grande de "Agotado / Disponible". |
| Editar producto | Todos los campos de la ficha + subir hasta 4 fotos desde la galería del celular. |
| Precios | Vista rápida de los 12 SKU para cambiar precios en bloque. |
| Pedidos | Bandeja con estados. Un toque para abrir el chat de WhatsApp de esa clienta. |
| Ajustes | Número de WhatsApp, costo de domicilio, mensaje del banner superior, texto de "Nosotros". |

**Seguridad:**
- La contraseña se guarda con `bcrypt` (nunca en texto plano, nunca en el código).
- Cookie `httpOnly`, `secure`, `sameSite=lax`.
- `/admin/*` y las rutas de escritura de la API bloqueadas por middleware.
- Rate limit en el login (5 intentos / 15 min) para evitar fuerza bruta.
- Las variables sensibles viven en Vercel (`ADMIN_PASSWORD_HASH`, `DATABASE_URL`, `SESSION_SECRET`), nunca en el repositorio.

---

## 6. App móvil: PWA, no app nativa

**Decisión: Progressive Web App instalable.** No React Native, no Flutter.

| Criterio | PWA | App nativa (React Native/Expo) |
|---|---|---|
| Costo | $0 | Google Play $25 único + Apple $99/año |
| Tiempo | Incluido en el desarrollo web | +3–4 semanas y un código base aparte |
| Actualizaciones | Instantáneas | Revisión de tienda de 1–7 días |
| Instalación | "Agregar a pantalla de inicio" desde el navegador | Descarga de la tienda |
| Cámara para subir fotos | Sí, funciona | Sí |
| Notificaciones push | Sí en Android; en iOS solo si está instalada | Sí |

Con un solo código se obtienen **dos apps**: la tienda que la clienta puede instalar, y el panel que las dueñas instalan como "app de administración" con su propio ícono.

Se implementa con `app/manifest.ts`, íconos 192/512 px, `display: standalone`, tema `#E88BB4` y un service worker que cachea el catálogo para que se vea aunque la señal esté mala.

Si más adelante quieren estar en Google Play, la misma PWA se empaqueta con **Bubblewrap/TWA** sin reescribir nada.

---

## 7. Rendimiento

El sitio es 80% imágenes; ahí se gana o se pierde.

- Formato **AVIF/WebP** automático vía `next/image`, con `sizes` correcto por breakpoint.
- La foto del hero con `priority`; el resto en carga diferida.
- Fuentes autohospedadas con `next/font` (sin llamadas a Google en producción).
- Páginas de producto **estáticas con revalidación** (`revalidate: 3600`): rapidísimas y se actualizan solas cuando cambia el catálogo.
- Objetivo: **Lighthouse ≥ 95** en móvil, LCP < 2.0 s en 4G.

---

## 8. Despliegue

```bash
# 1. Repositorio
git init && git add . && git commit -m "Inicio del proyecto"
gh repo create jabones-mari --private --source=. --push

# 2. Vercel (root directory = web/)
npm i -g vercel
vercel link
vercel integration add neon --yes     # base de datos gratuita
vercel env pull --yes                 # trae DATABASE_URL a .env.local

# 3. Migraciones y datos iniciales
cd web && npm run db:push && npm run db:seed

# 4. Producción
vercel --prod
```

Cada `git push` a `main` despliega a producción; cada rama genera una URL de previsualización para revisar cambios antes de publicarlos.

---

## 9. Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a Neon (la crea la integración). |
| `SESSION_SECRET` | Firma de la cookie de sesión del panel. |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña del panel. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573XXXXXXXXX`, sin `+` ni espacios. |
| `NEXT_PUBLIC_SITE_URL` | Para canónicas, sitemap y Open Graph. |
| `BLOB_READ_WRITE_TOKEN` | Subida de fotos desde el panel. |
