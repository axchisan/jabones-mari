# SEO y difusión

## 1. Qué busca realmente la gente

El error típico es optimizar para "jabones Mari" — nadie busca una marca que no conoce. Hay que atacar la búsqueda de **problema** y de **intención local**.

| Intención | Consultas reales | Dónde se responde |
|---|---|---|
| Local + compra | `jabones artesanales bogotá`, `jabón natural bogotá domicilio`, `dónde comprar jabón artesanal bogotá` | Home + Catálogo |
| Producto | `jabón de arroz`, `jabón de avena para piel sensible`, `jabón de cúrcuma para el acné`, `jabón de romero y menta` | Ficha de cada producto |
| Problema | `jabón para piel sensible`, `jabón para manchas en la cara`, `jabón natural sin químicos` | Página de producto + filtros |
| Regalo | `detalles personalizados bogotá`, `regalos artesanales bogotá`, `souvenirs para eventos` | Página de combos/regalo |

**Palabra clave principal:** `jabones artesanales Bogotá`
**Secundarias:** `jabón natural hecho a mano`, `jabón de glicerina artesanal`, + una por receta.

---

## 2. Mapa de títulos y descripciones

| Página | `<title>` (≤ 60) | `<meta description>` (≤ 155) |
|---|---|---|
| Home | Jabones Mari · Jabones artesanales naturales en Bogotá | Jabones de glicerina hechos a mano con avena, arroz, cúrcuma, romero y naranja. Desde $5.000. Domicilios en Bogotá. Pide por WhatsApp. |
| Catálogo | Catálogo de jabones artesanales · Mari | Conoce nuestras 6 recetas naturales en tamaño grande y pequeño. Filtra por tipo de piel y beneficio. Envíos en Bogotá. |
| Menta y Romero | Jabón de Menta y Romero artesanal · Mari | Refresca, purifica y ayuda a controlar la grasa. Hecho a mano con romero natural. Grande $7.500 · Pequeño $5.000. |
| Arroz | Jabón de Arroz artesanal · aclara e ilumina · Mari | Agua de arroz para unificar el tono y dar luminosidad. Suave, sin perfume. Grande $7.500 · Pequeño $5.000. |
| Avena | Jabón de Avena para piel sensible · Mari | Exfolia con suavidad y calma la piel irritada. Ideal para piel seca y sensible. Desde $5.000 en Bogotá. |
| Arroz y Avena | Jabón de Arroz y Avena artesanal · Mari | Exfolia e ilumina en una sola pastilla. Para todo tipo de piel, incluso sensible. Desde $5.000. |
| Cúrcuma y Miel | Jabón de Cúrcuma y Miel · piel mixta · Mari | Cúrcuma antioxidante y miel humectante para una piel más equilibrada y luminosa. Desde $5.000. |
| Naranja y Coco | Jabón de Naranja y Aceite de Coco · Mari | Vitamina C que ilumina y coco que nutre en profundidad. Aroma cítrico natural. Desde $5.000. |
| Nosotros | Nuestra historia · Jabones Mari, hechos a mano | Un emprendimiento familiar bogotano. Cada jabón se hace en casa, en tandas pequeñas, con ingredientes naturales. |

---

## 3. SEO técnico (se implementa en el código)

- **Metadata API de Next.js** por página, con títulos y descripciones de la tabla anterior.
- **URLs limpias y en español:** `/producto/menta-romero`, no `/p?id=3`.
- **Canónicas** en todas las páginas.
- **`sitemap.xml`** generado dinámicamente desde la base de datos (`app/sitemap.ts`): cuando publiquen un producto nuevo, entra solo al sitemap.
- **`robots.txt`** que bloquea `/admin` y `/api` y permite todo lo demás.
- **Open Graph + Twitter Card** en cada producto, con su foto: cuando alguien pegue el enlace en WhatsApp o Instagram, se ve la tarjeta con foto y precio. Esto sube el clic muchísimo en un negocio que vive de WhatsApp.
- **`alt` descriptivo en cada imagen**: `"Jabón artesanal de menta y romero en forma de corazón, color verde jade con ramita de romero"`. Es accesibilidad y es SEO de Google Imágenes, que para cosmética trae mucho tráfico.
- **Encabezados jerárquicos**: un solo `<h1>` por página, con la palabra clave.
- **Core Web Vitals**: LCP < 2 s, CLS < 0.1. Se logra con `next/image`, `next/font` y páginas estáticas.

---

## 4. Datos estructurados (JSON-LD)

Es lo que hace que Google muestre el **precio y la disponibilidad directamente en los resultados**. Gratis y de altísimo impacto.

**En cada ficha de producto** — `Product` + `Offer`:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Jabón artesanal de Menta y Romero",
  "image": ["https://jabonesmari.vercel.app/productos/menta-romero-1.jpg"],
  "description": "Jabón de glicerina artesanal con romero natural y menta...",
  "brand": { "@type": "Brand", "name": "Mari" },
  "offers": [{
    "@type": "Offer",
    "price": "7500",
    "priceCurrency": "COP",
    "availability": "https://schema.org/InStock",
    "url": "https://jabonesmari.vercel.app/producto/menta-romero",
    "areaServed": "Bogotá, Colombia"
  }]
}
```

**En el home** — `LocalBusiness`:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Jabones Mari",
  "description": "Jabones artesanales naturales hechos a mano en Bogotá",
  "address": { "@type": "PostalAddress", "addressLocality": "Bogotá", "addressCountry": "CO" },
  "areaServed": "Bogotá",
  "priceRange": "$5.000 - $7.500 COP",
  "sameAs": ["https://instagram.com/..."]
}
```

Validar en [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

---

## 5. SEO local: lo más rentable de toda esta lista

Para un negocio de barrio, **Google Business Profile pesa más que el sitio web**.

1. Crear la ficha en [business.google.com](https://business.google.com) → categoría *Fabricante de jabón* / *Tienda de cosméticos*.
2. Definir **área de servicio: Bogotá** (no hace falta publicar la dirección de la casa).
3. Subir las fotos generadas y el enlace al sitio.
4. **Pedirle reseña a cada clienta que ya compró.** Diez reseñas de 5 estrellas valen más que meses de optimización.
5. Publicar cada 15 días desde la ficha (producto nuevo, combo, promoción).

---

## 6. Difusión y contenido

| Canal | Acción | Frecuencia |
|---|---|---|
| Instagram | Publicar los 6 folletos, uno cada 2 días. Luego, fotos de proceso. | 3/semana |
| Estados de WhatsApp | El folleto del día + enlace directo al catálogo | 2/semana |
| Etiqueta del producto | Imprimir un **QR** que lleve al sitio. Cada jabón vendido se convierte en publicidad. | Una vez |
| Google Business | Ficha + reseñas | Continuo |
| Marketplace de Facebook | Publicar los combos | 1/semana |
| Pinterest | Las fotos de producto posicionan muy bien en búsquedas de cosmética natural | 2/semana |

**Contenido que funciona en este nicho (para más adelante):**
- "Cómo saber qué jabón le sirve a tu tipo de piel" (atrapa búsquedas de problema)
- "Por qué la glicerina artesanal no reseca como el jabón de supermercado"
- Video corto del proceso de vertido en los moldes — es el contenido que más se comparte en artesanía.

---

## 7. Medición

| Herramienta | Qué mirar | Cada cuánto |
|---|---|---|
| Google Search Console | Impresiones, clics, consultas que ya traen gente | Semanal |
| Vercel Web Analytics | Páginas más vistas, de dónde llegan | Semanal |
| Evento propio `pedido_whatsapp` | Cuántos carritos terminan en WhatsApp | Semanal |
| Panel de pedidos | Producto más vendido, ticket promedio | Mensual |

**La métrica que de verdad importa:** cuántos pedidos entran por la web frente a cuántos entran por chat directo. Si en 3 meses la web no genera pedidos, el problema no es el SEO — es el tráfico, y toca empujar desde Instagram.

---

## 8. Primeras 48 horas después del lanzamiento

1. Verificar el dominio en Google Search Console y enviar el `sitemap.xml`.
2. Crear la ficha de Google Business Profile.
3. Poner el enlace en la bio de Instagram y en el perfil de WhatsApp Business.
4. Mandar el enlace a todas las clientas que ya compraron, pidiendo reseña.
5. Publicar los 6 folletos.
6. Revisar con el móvil real que el flujo carrito → WhatsApp funcione de punta a punta.
