# Search Console y posicionamiento

Qué hacer en Search Console ahora que el dominio está verificado, y qué mirar después.
Todo esto es gratis.

---

## Antes de empezar: lo que el sitio ya trae hecho

No hace falta tocar el código para nada de lo que sigue. Esto ya está en producción:

| | Estado |
|---|---|
| `sitemap.xml` | 13 URLs, se actualiza solo al publicar un producto |
| `robots.txt` | Permite todo menos `/admin`, `/api` y `/pedido` |
| Títulos y descripciones | Únicos por página, dentro del largo que Google muestra |
| Datos estructurados | `LocalBusiness`, `WebSite`, `Product` con precio y disponibilidad, `BreadcrumbList`, `FAQPage` |
| Canónicas | En todas las páginas |
| `www` | Redirige con 308 al dominio sin `www` |
| Open Graph | Foto y descripción al compartir el enlace en WhatsApp |
| Velocidad | Respuestas entre 0,27 y 0,35 s |

---

## 1. Enviar el sitemap

Es lo primero y lo más importante: le dice a Google qué páginas existen sin que tenga que
adivinarlas.

1. En Search Console, menú lateral → **Sitemaps**.
2. En *Añadir un sitemap nuevo*, escribe `sitemap.xml` (solo eso, el dominio ya viene puesto).
3. **Enviar**.

Al cabo de unos minutos debe decir **Correcto** y *13 páginas descubiertas*. Si dice "No se ha
podido obtener", espera unas horas y actualiza: a veces Google tarda en leerlo la primera vez.

> Cuando publiques un producto nuevo desde el panel, **no hay que reenviar nada**: el sitemap se
> genera desde la base de datos y Google lo vuelve a leer solo.

---

## 2. Pedir la indexación de las páginas principales

Enviar el sitemap no garantiza que Google visite las páginas hoy. Para las más importantes,
pídelo a mano:

1. Arriba, en la barra de búsqueda de Search Console (*Inspeccionar cualquier URL*), pega:
   `https://jabonesmari.shop`
2. Espera el análisis y pulsa **Solicitar indexación**.
3. Repite con estas, que son las que traerán clientas:

   ```
   https://jabonesmari.shop/catalogo
   https://jabonesmari.shop/producto/menta-romero
   https://jabonesmari.shop/producto/arroz
   https://jabonesmari.shop/producto/avena
   https://jabonesmari.shop/producto/arroz-avena
   https://jabonesmari.shop/producto/curcuma-miel
   https://jabonesmari.shop/producto/naranja-coco
   ```

Hay un límite de unas 10 solicitudes al día. Con estas siete vas bien.

**Cuánto tarda:** de unas horas a un par de semanas. Un dominio recién creado siempre tarda más;
es normal y no significa que algo esté mal.

---

## 3. Comprobar que los productos se ven bien en los resultados

Esto es lo que hace que Google muestre **el precio y "En stock" debajo del título**, en vez de
solo un enlace. Ya está implementado; solo hay que confirmarlo.

1. Ve a [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results).
2. Pega `https://jabonesmari.shop/producto/curcuma-miel`.
3. Debe detectar **Fragmentos de producto** y **Ruta de navegación**, sin errores.

En Search Console, esa misma información aparece con los días en el menú lateral, bajo
**Mejoras** → *Fragmentos de productos*. Ahí se ven los avisos si algo se rompe.

> **Aviso que probablemente verás:** *"Falta el campo review / aggregateRating"*. Es una
> **advertencia, no un error**: Google pide reseñas si las tienes, y todavía no hay ninguna en la
> página. No impide que se muestre el precio.

---

## 4. Configurar la ficha para Colombia

En **Configuración** (engranaje abajo a la izquierda):

- **Segmentación internacional** → País → marca **Colombia**. Le dice a Google que este sitio le
  interesa sobre todo a quien busca desde Colombia.
- **Usuarios y permisos** → agrega el correo de tu prima como *Propietario* o *Usuario completo*,
  para que ella también pueda mirar.

---

## 5. Qué mirar cada semana (5 minutos)

Menú **Rendimiento**. Ahí está lo único que de verdad importa: por qué palabras te encuentran.

| Dónde mirar | Qué buscar |
|---|---|
| **Consultas** | Las búsquedas reales que traen gente. Aquí están las ideas de producto y de texto. |
| **Páginas** | Qué fichas se ven más. Si una no aparece nunca, revisa su texto. |
| **Impresiones** | Cuántas veces saliste en resultados. Sube antes que los clics. |
| **CTR** | De los que te vieron, cuántos entraron. Si es bajo, mejora título y descripción. |

**El truco que más sirve:** ordena las consultas por impresiones y busca las que tienen muchas
impresiones y pocos clics. Son búsquedas donde ya apareces pero no convences — y suelen
arreglarse cambiando el título o la descripción desde el panel.

Ejemplo real de cómo usarlo: si ves que mucha gente llega buscando *"jabón para el acné"*, esa es
la señal para ajustar el texto del jabón de cúrcuma y miel — siempre en lenguaje cosmético, sin
prometer que cura nada.

En **Cobertura / Indexación de páginas** se ve cuáles quedaron fuera. Que `/admin` y `/pedido`
aparezcan como *Bloqueada por robots.txt* **es lo correcto**, no un problema.

---

## 6. Lo que vale más que Search Console

Para un negocio local, **Google Business Profile pesa más que el sitio web**. Es lo que hace que
aparezcas en el mapa y en el recuadro lateral cuando alguien busca "jabones artesanales Bogotá".

1. Entra a [business.google.com](https://business.google.com) con la misma cuenta.
2. Nombre: `Jabones Mari`. Categoría: *Fabricante de jabón* o *Tienda de cosméticos*.
3. **Área de servicio: Bogotá.** No publiques la dirección de la casa — Google permite negocios
   sin local visible.
4. Sube las fotos del catálogo y enlaza `https://jabonesmari.shop`.
5. Pon el WhatsApp como teléfono de contacto.

Y lo más importante: **pídele reseña a cada clienta que ya compró.** Diez reseñas de cinco
estrellas mueven más la aguja que meses de optimización técnica.

---

## 7. Calendario realista

| Cuándo | Qué |
|---|---|
| Hoy | Enviar el sitemap, pedir indexación de las 7 páginas, segmentar a Colombia |
| Esta semana | Crear Google Business Profile y pedir las primeras reseñas |
| Semana 2 | Comprobar que las páginas ya están indexadas (búscalo con `site:jabonesmari.shop`) |
| Semana 4 | Primera revisión de *Rendimiento*: qué consultas aparecen |
| Mes 2-3 | Ajustar títulos y descripciones según lo que muestren las consultas reales |

**Expectativa honesta:** un dominio nuevo tarda entre 2 y 8 semanas en posicionar para búsquedas
locales, y las primeras visitas serán de gente que ya te conoce y busca "jabones mari". El tráfico
por búsquedas de problema (*"jabón para piel sensible"*) llega después, y llega antes si hay
reseñas en Google Business.

---

## 8. Si algo sale mal

| Lo que ves | Qué significa |
|---|---|
| "No se ha podido obtener el sitemap" | Google aún no lo ha leído. Espera 24 h antes de preocuparte. |
| "Detectada, actualmente sin indexar" | Google la conoce pero no le ha dado prioridad. Normal en sitios nuevos. |
| "Rastreada, actualmente sin indexar" | La visitó y decidió no indexarla todavía. Suele resolverse solo. |
| "Página alternativa con etiqueta canónica" | Correcto si es `www`: está redirigiendo como debe. |
| "Bloqueada por robots.txt" en `/admin` | Correcto. Es lo que queremos. |
| Cae el tráfico de golpe | Revisa primero que el sitio cargue y que no se haya ocultado algún producto sin querer. |

Para comprobar qué tiene Google indexado en cualquier momento, busca en Google:

```
site:jabonesmari.shop
```
