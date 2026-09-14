# Jabones Mari — Plan maestro del proyecto

> **Marca:** Mari · *Limpieza con el alma*
> **Negocio:** jabones artesanales, elaborados a mano, libres de químicos agresivos.
> **Ciudad base:** Bogotá, Colombia.
> **Fecha del plan:** 12 de septiembre de 2026.

---

## 1. Qué problema resuelve la web

Hoy el emprendimiento vende de boca en boca y por WhatsApp. El cuello de botella es:

1. **No hay vitrina.** No existe un lugar al que mandar a alguien que pregunta "¿qué jabones tienes?".
2. **Las fotos no venden.** Las fotos actuales son caseras, con luz morada de bombillo, fondo de tela arrugada y el jabón mal encuadrado. Un producto artesanal de $7.500 puede verse de $20.000 con fotografía correcta.
3. **El pedido se pierde en la conversación.** Sin carrito, la clienta escribe, pregunta precios, el vendedor calcula, y a veces no se cierra.
4. **Nadie las encuentra.** No hay presencia en Google para "jabones artesanales Bogotá".

La web ataca los cuatro puntos: catálogo visual, carrito, pedido pre-armado que aterriza en WhatsApp listo para confirmar, y SEO local.

---

## 2. Objetivos medibles (primeros 90 días)

| Objetivo | Métrica | Meta |
|---|---|---|
| Vitrina viva | Productos publicados con foto final | 6 recetas × 2 tamaños = 12 SKU |
| Conversión | Pedidos iniciados → WhatsApp | ≥ 25% de quien abre el carrito |
| Ticket promedio | Valor por pedido | Subir de 1 jabón a ≥ 3 (combos) |
| Alcance orgánico | Impresiones en Google Search Console | > 500/mes |
| Autonomía | Cambios de catálogo hechos por las dueñas, sin programador | 100% |

---

## 3. Alcance (qué sí y qué no, versión 1)

**Sí entra:**
- Home con propuesta de marca e historia del emprendimiento.
- Catálogo filtrable (por beneficio, tipo de piel, tamaño).
- Ficha de producto con ingredientes, beneficios, modo de uso y precio.
- Carrito persistente (sobrevive si cierran el navegador).
- Checkout sin pasarela: formulario con nombre, teléfono, dirección en Bogotá, notas → genera el pedido y abre WhatsApp con todo el detalle escrito.
- Registro del pedido en base de datos (para no depender de que WhatsApp no se pierda).
- Panel de administración protegido: crear/editar/ocultar productos, cambiar precios, subir fotos, marcar agotados, ver pedidos.
- Instalable como app en el celular (PWA) — tanto para clientas como para el panel de las dueñas.
- SEO local, datos estructurados, sitemap, Open Graph.
- Página de contacto + enlace directo a WhatsApp flotante.

**No entra en v1 (queda para fase 2):**
- Pasarela de pago en línea (Wompi / Mercado Pago / Bold). Se conecta cuando el volumen lo justifique.
- Cuentas de clientes / historial de compras.
- Blog de contenidos.
- Envíos nacionales con integración de transportadora.
- Multi-idioma.

---

## 4. Costo: $0 en la fase inicial

| Componente | Servicio | Plan | Costo |
|---|---|---|---|
| Hosting + CDN + SSL | Vercel Hobby | Gratis | $0 |
| Dominio | `jabonesmari.shop` (Hostinger) | Anual | ~$40.000 COP/año |
| Base de datos | Neon Postgres (free tier) | Gratis | $0 |
| Imágenes del catálogo | Repositorio + optimizador de Next.js | Gratis | $0 |
| Fotos subidas desde el panel | Cloudflare R2 (10 GB gratis) | Gratis | $0 |
| Generación de imágenes | Google AI Studio / Gemini | Gratis (cuota diaria) | $0 |
| Analítica | Vercel Web Analytics + Google Search Console | Gratis | $0 |
| Ficha en Google Maps | Google Business Profile | Gratis | $0 |
| Código | GitHub | Gratis | $0 |

**Cuándo pasar a pago (fase 2):** cuando haya ≥ 30 pedidos/mes o la marca quiera tarjeta de presentación propia.
- Dominio `.com.co` ≈ **$25.000–$40.000 COP/año** (Namecheap, GoDaddy, Hostinger).
- Dominio `.com` ≈ **$50.000–$70.000 COP/año**.
- Sugerencia de dominio: `jabonesmari.com.co` · `marijabones.com` · `limpiezaconelalma.com`.
- Vercel Pro ($20 USD/mes) **no es necesario** ni con tráfico moderado.

---

## 5. Fases de ejecución

### Fase 0 — Base (esta semana)
- [x] Análisis del material existente (fotos, logos, referencias).
- [x] Definición de stack, infraestructura y dominio.
- [ ] Scaffolding del proyecto Next.js + sistema de diseño.
- [ ] Ficha técnica de los 6 productos (ver `03-catalogo.md`).

### Fase 1 — Contenido visual (bloqueante, hacerlo en paralelo)
- [ ] Generar con Gemini las fotos de producto de los 12 SKU (ver `05-prompts-gemini.md`).
- [ ] Generar hero, texturas y fondos de marca.
- [ ] Generar los folletos publicitarios estilo referencia.
- [ ] Vectorizar el logo definitivo a SVG (para que se vea nítido en cualquier tamaño).

### Fase 2 — Sitio público
- [ ] Home, catálogo, ficha de producto, carrito, checkout → WhatsApp.
- [ ] PWA instalable.
- [ ] SEO técnico + datos estructurados.

### Fase 3 — Panel de administración
- [ ] Login protegido.
- [ ] CRUD de productos, precios, stock y fotos.
- [ ] Bandeja de pedidos con estados (nuevo → confirmado → entregado).

### Fase 4 — Lanzamiento y difusión
- [ ] Deploy en Vercel + Google Search Console + Google Business Profile.
- [ ] Publicación de folletos en Instagram/WhatsApp Estados.
- [ ] Enlace en la bio de Instagram y en las etiquetas del producto (QR).

---

## 6. Decisiones pendientes de las dueñas

Estas cinco cosas necesito que las confirmen ustedes, no las puedo inventar:

1. **Número de WhatsApp** del negocio (con indicativo, ej. `57 3XX XXX XXXX`).
2. **Peso real** del jabón grande y del pequeño en gramos (para la ficha técnica; hoy asumo ~100 g y ~60 g).
3. **Política de entrega:** ¿domicilio en toda Bogotá? ¿costo fijo o por zona? ¿monto mínimo de pedido? ¿punto de encuentro?
4. **Precios de combo** (propuesta en `03-catalogo.md`, sección 4).
5. **Usuario y clave del panel** de administración (o los correos que tendrán acceso).

---

## 7. Documentos del proyecto

| Archivo | Contenido |
|---|---|
| `01-plan-maestro.md` | Este documento. |
| `02-identidad-visual.md` | Paleta, tipografía, tono, reglas de uso del logo. |
| `03-catalogo.md` | Ficha completa de cada jabón: ingredientes, beneficios, uso, precios. |
| `04-arquitectura.md` | Stack, modelo de datos, flujo de pedido, seguridad, deploy. |
| `05-prompts-gemini.md` | Prompts listos para copiar y generar todas las imágenes. |
| `06-seo.md` | Estrategia de posicionamiento local y contenido. |
| `07-google-oauth.md` | Configurar el ingreso con Google, paso a paso. |
| `08-despliegue.md` | Publicar en producción, CI/CD, dominio y variables. |
| `09-search-console.md` | Search Console, indexación y medición. |
| `10-publicidad.md` | Cómo se arman las piezas publicitarias y por qué. |
| `11-prompts-listos.md` | Los 21 prompts ya ensamblados, para copiar y pegar. |
| `12-whatsapp-business.md` | Qué hacer con el número del negocio. |
| `13-avisos.md` | Avisos de pedidos por notificación y por correo. |
