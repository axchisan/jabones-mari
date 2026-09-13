# Prompts para Gemini — generación de todas las imágenes

## 0. Cómo usar este documento

**Herramienta:** [Google AI Studio](https://aistudio.google.com) → modelo **Gemini con generación de imagen** (Nano Banana). Gratis con cuota diaria. También sirve la app de Gemini.

**Regla de oro: no generes los jabones desde cero.** Sube la foto real como referencia y pide una *reinterpretación*. Así el jabón generado conserva la forma, el color y las inclusiones reales del producto que vas a entregar. Si generas de cero, le vas a mostrar a la clienta un jabón que no existe — y eso genera devoluciones y desconfianza.

**Flujo por cada imagen:**
1. Abre AI Studio y sube la foto original de `Catalogo de Jabones/`.
2. Pega el **prompt base de estilo** (sección 1) + el **prompt del producto** (sección 2).
3. Genera 3–4 variantes. Elige la que respete mejor la forma real.
4. Si algo falla, corrígelo conversando: *"la sombra es muy dura, suavízala"*, *"el jabón quedó más azul que el real, acércalo al verde jade de la foto"*.
5. Descarga en la mayor resolución posible y guarda con el nombre indicado.

**Lo que la IA hace bien:** re-iluminar, cambiar fondo, limpiar, componer, agregar ingredientes alrededor.
**Lo que la IA hace mal:** texto largo en español (sale con errores), reproducir un logo exacto, y mantener coherencia de marca entre 12 imágenes sin que se lo recuerdes.
→ Por eso el **logo y todo el texto de los folletos se ponen después**, no se generan.

---

## 1. Prompt base de estilo (va al inicio de CADA generación de producto)

```
Eres un fotógrafo de producto especializado en cosmética natural artesanal.

A partir de la imagen de referencia que te doy, genera una fotografía de producto
profesional del MISMO jabón, conservando con exactitud su forma, su color real,
su transparencia y las inclusiones visibles (hierbas, hojuelas, ralladura, motas).
No inventes un jabón distinto: es una nueva toma del mismo objeto.

ESTILO OBLIGATORIO:
- Fondo liso color crema cálido (#FDF9F5), sin telas arrugadas ni texturas que distraigan.
- Luz natural suave de ventana lateral, temperatura neutra (5500K). Nada de luz morada,
  azul ni de bombillo. El color del jabón debe leerse tal como es en la vida real.
- Sombra larga, suave y difusa hacia la derecha. Nunca sombra dura de flash.
- Superficie de mármol blanco mate o papel texturizado crema.
- El jabón perfectamente centrado y enfocado, con la luz atravesándolo para que se
  aprecie su translucidez de glicerina.
- Formato cuadrado 1:1, calidad editorial, muy alta resolución, aspecto limpio y premium.
- Paleta general cálida: cremas, blancos rotos y el color propio del jabón.
- Sin texto, sin logos, sin marcas de agua, sin manos, sin personas.
- Realismo fotográfico absoluto. No ilustración, no render 3D, no estilo IA brillante.
```

---

## 2. Prompts por producto (foto principal del catálogo)

> Sube la foto indicada, pega el **prompt base** y luego el bloque del producto.

### 2.1 Menta y Romero
*Referencia:* `Catalogo de Jabones/Romero y menta grande.jpg`
*Guardar como:* `web/public/productos/menta-romero-1.jpg`

```
PRODUCTO: jabón artesanal de menta y romero.
Es una pastilla con forma de corazón irregular hecha a mano, de glicerina translúcida
color verde jade claro, con una ramita de romero seco visiblemente incrustada en su interior.
Conserva esa forma de corazón y esa ramita exactamente como en la referencia.

COMPOSICIÓN: el jabón en el centro, ligeramente girado. A su lado derecho, dos ramitas
frescas de romero y tres hojas de menta fresca apoyadas sobre la superficie de mármol.
Que se vea la luz atravesando el jabón por el borde izquierdo.
```

### 2.2 Arroz
*Referencia:* `Catalogo de Jabones/Arroz pequeño.jpg`
*Guardar como:* `web/public/productos/arroz-1.jpg`

```
PRODUCTO: jabón artesanal de arroz.
Pastilla redonda hecha a mano, de glicerina color blanco perla translúcido, superficie
satinada con relieve suave de corazoncitos. IMPORTANTE: el color real es blanco perla
cremoso, no lila — la foto de referencia está teñida por una luz morada, corrígelo.

COMPOSICIÓN: el jabón redondo en el centro, con un pequeño montoncito de granos de arroz
blanco derramado a su lado y un cuenco de cerámica blanca desenfocado al fondo.
```

### 2.3 Avena
*Referencia:* usar la foto de arroz y avena como base de textura
*Guardar como:* `web/public/productos/avena-1.jpg`

```
PRODUCTO: jabón artesanal de avena.
Pastilla ovalada hecha a mano, de glicerina color crema opalino, con hojuelas de avena
visibles suspendidas y también espolvoreadas sobre la superficie superior.

COMPOSICIÓN: el jabón en el centro; a su alrededor, hojuelas de avena sueltas y una
cuchara de madera pequeña con avena. Textura cálida y acogedora, ambiente de mañana.
```

### 2.4 Arroz y Avena
*Referencia:* `Catalogo de Jabones/Avena y arroz grande.jpg`
*Guardar como:* `web/public/productos/arroz-avena-1.jpg`

```
PRODUCTO: jabón artesanal de arroz y avena.
Pastilla ovalada hecha a mano, color blanco marfil, con partículas doradas de avena
y puntitos de harina de arroz suspendidos en la glicerina. Conserva las motas visibles
de la referencia. Corrige el tinte morado de la foto original: el color real es marfil cálido.

COMPOSICIÓN: el jabón en el centro, con granos de arroz a un lado y hojuelas de avena
al otro, ambos formando una línea diagonal suave sobre el mármol.
```

### 2.5 Cúrcuma y Miel
*Referencia:* `Catalogo de Jabones/Curcuma y mielgrande.jpg`
*Guardar como:* `web/public/productos/curcuma-miel-1.jpg`

```
PRODUCTO: jabón artesanal de cúrcuma y miel.
Pastilla ovalada hecha a mano, de glicerina color rosa terracota translúcido con motas
finas de cúrcuma en polvo distribuidas por dentro. Conserva ese color terracota rosado real.

COMPOSICIÓN: el jabón en el centro. A su lado, un cucharón de miel dorada goteando hacia
un cuenco pequeño, y una cucharadita de cúrcuma en polvo naranja intenso.
Luz cálida y dorada que refuerce el aroma especiado.
```

### 2.6 Naranja y Aceite de Coco
*Referencia:* `Catalogo de Jabones/Naranja Grande.jpg`
*Guardar como:* `web/public/productos/naranja-coco-1.jpg`

```
PRODUCTO: jabón artesanal de naranja con aceite de coco.
Pastilla con forma de corazón irregular hecha a mano, de glicerina color ámbar anaranjado
translúcido, con ralladura y trocitos de cáscara de naranja claramente visibles incrustados.
Conserva la forma de corazón y esas inclusiones de la referencia.

COMPOSICIÓN: el jabón en el centro; a su derecha, media naranja fresca cortada y una rodaja
fina; a la izquierda, media cáscara de coco con pulpa blanca. Luz cálida y luminosa,
sensación cítrica y energética.
```

---

## 3. Segunda foto de cada producto (vista de escena / lifestyle)

Cada producto necesita mínimo 2 fotos: el *packshot* limpio (sección 2) y una de ambiente que genere deseo.

```
Usando la misma imagen de referencia del jabón, genera ahora una fotografía de ambiente:

El jabón reposa sobre una jabonera de cerámica artesanal blanca, junto al borde de un
lavamanos de mármol claro. Al fondo, desenfocado, una toalla de lino color crema doblada
y un pequeño ramo de [flores blancas / romero / flores secas rosadas].
Luz de ventana por la izquierda, matinal, con sombras suaves y largas.
Ambiente de baño cálido, natural y cuidado. Paleta crema, blanco roto y toques del color
propio del jabón.
Fotografía realista, profundidad de campo baja, formato 4:5 vertical, alta resolución.
Sin texto ni logos.
```

Guardar como `web/public/productos/<slug>-2.jpg`.

---

## 4. Foto de familia (los seis juntos) — para el home

*Guardar como:* `web/public/hero-familia.jpg`

> Sube **las seis fotos** de referencia a la vez.

```
Con los seis jabones de las imágenes de referencia (verde de menta y romero, blanco perla
de arroz, crema de avena, marfil de arroz y avena, terracota de cúrcuma y miel, ámbar de
naranja y coco), genera una fotografía cenital de producto:

Los seis jabones dispuestos en una composición orgánica sobre una superficie de mármol
blanco, ligeramente superpuestos, cada uno conservando su forma y color reales
(hay corazones, óvalos y redondos).
Alrededor, esparcidos con naturalidad: ramitas de romero, granos de arroz, hojuelas de
avena, una rodaja de naranja y una flor seca rosada.
Luz natural cenital suave, sombras delicadas, fondo crema cálido (#FDF9F5).
Espacio vacío en el tercio superior para colocar texto después.
Formato 16:9 horizontal, muy alta resolución, estilo editorial de revista de cosmética natural.
Sin texto, sin logos.
```

**Variante vertical para móvil** (`hero-familia-movil.jpg`): el mismo prompt cambiando a `formato 4:5 vertical, con espacio vacío en la mitad inferior`.

---

## 5. Imágenes de marca y secciones

### 5.1 Banda de proceso artesanal (sección "Nosotros")
```
Fotografía cálida y documental de un proceso artesanal de elaboración de jabón en una cocina
casera luminosa: unas manos femeninas jóvenes vertiendo glicerina líquida translúcida desde
una jarra de vidrio hacia moldes de silicona con forma de corazón y flor, sobre un mesón de
madera clara. Alrededor, cuencos con avena, arroz, romero fresco y cúrcuma en polvo.
Luz de ventana lateral, tonos crema y madera, ambiente íntimo y hecho a mano.
Fotografía realista, formato 3:2, alta resolución. Sin texto ni logos.
Enfoque en las manos y el chorro de glicerina.
```
*Guardar como:* `web/public/proceso-artesanal.jpg`

### 5.2 Textura de fondo de marca
```
Textura abstracta de acuarela en color rosa muy pálido (#FBE4EE) sobre papel crema
(#FDF9F5), con trazos suaves de pincel de bordes irregulares y algunas siluetas muy
tenues de mariposas de line art en un tono rosa apenas más oscuro.
Diseño limpio, mucho espacio en blanco, sutil, pensado para usarse como fondo detrás
de texto oscuro. Formato 16:9, alta resolución. Sin texto.
```
*Guardar como:* `web/public/textura-fondo.jpg`

### 5.3 Detalle para regalo (producto de mayor margen)
```
Fotografía de producto de un set de regalo de jabones artesanales: tres jabones pequeños
redondos de colores diferentes (verde jade, blanco perla y ámbar anaranjado) dentro de una
bolsa de organza rosa pálido con cinta de satén, acompañados de una tarjetita de papel
kraft en blanco. Sobre mármol blanco, con pétalos rosados secos esparcidos.
Luz suave de ventana, paleta crema y rosa. Formato 1:1, realista, alta resolución.
Sin texto ni logos.
```
*Guardar como:* `web/public/productos/detalle-regalo.jpg`

---

## 6. Folletos publicitarios (estilo de las referencias)

### 6.1 La forma correcta de hacerlos

Los modelos de imagen **todavía escriben mal en español** — devuelven "BENEFICOS", "HIDRATACION PROFUNDA" sin tilde o letras deformadas. Un folleto con una falta de ortografía destruye la percepción de calidad.

**Método recomendado (el que da resultado profesional):**
1. Genera con Gemini **solo la foto del producto** (sección 2).
2. Arma el folleto con el texto encima en **Canva** (gratis) o con la plantilla HTML que incluye este proyecto (`web/src/app/admin/folletos`), que exporta el folleto ya listo a 1080×1080 px con la tipografía y la paleta correctas.

Así el texto siempre sale perfecto, el logo es el real, y cambiar un precio toma 5 segundos.

### 6.2 Prompt para generar el **fondo** del folleto

```
Diseño de fondo para una publicación cuadrada de Instagram (1080x1080) de una marca de
jabones artesanales femenina y delicada.

Fondo color crema cálido (#FDF9F5). En la mitad inferior, dos bandas horizontales
superpuestas con textura de trazo de pincel de bordes irregulares: una banda gruesa en
color [COLOR DEL PRODUCTO] y encima, desfasada, una banda más delgada en un tono más claro
del mismo color.
En el tercio superior, un marco de trazo de pincel irregular en el mismo color, que servirá
para insertar después una fotografía.
Esquinas con detalles muy sutiles de line art: una mariposa y ramitas florales en rosa pálido.
Diseño limpio, mucho espacio libre, estilo cosmética natural artesanal.
IMPORTANTE: sin ningún texto, sin letras, sin logos. Solo el diseño de fondo.
```

Reemplaza `[COLOR DEL PRODUCTO]` según la receta:
| Producto | Color |
|---|---|
| Menta y romero | verde salvia `#7E9A7C` |
| Arroz | arena perlada `#D9C7B4` |
| Avena | avena tostada `#C9A87C` |
| Arroz y avena | beige cálido `#D6B99A` |
| Cúrcuma y miel | dorado `#C9A227` |
| Naranja y coco | naranja suave `#E08A4B` |

### 6.3 Contenido de cada folleto (para escribirlo encima)

Estructura calcada de las referencias, que funciona:

```
[ FOTO DEL PRODUCTO con borde de pincel ]

          MENTA Y ROMERO
─────────────────────────────────────
 Tipo de piel: Mixta y grasa
 Peso: 100 gr    Uso: Corporal
─────────────────────────────────────
            BENEFICIOS
 ✓ Refresca y revitaliza    ✓ Purificante natural
 ✓ Controla la grasa        ✓ Efecto descongestionante
 ✓ Alivia pies cansados     ✓ Aroma energizante
─────────────────────────────────────
 Grande $7.500 · Pequeño $5.000
 [logo Mari]     WhatsApp 3XX XXX XXXX
```

Los seis bloques de beneficios están en `03-catalogo.md`, listos para copiar.

### 6.4 Prompt para historia de Instagram (9:16)
```
Diseño vertical 1080x1920 para historia de Instagram de una marca de jabones artesanales.
Fondo crema cálido (#FDF9F5) con una gran mancha de acuarela rosa pálido en la parte
superior y trazos de pincel rosa en la inferior.
En el centro, un espacio circular limpio con borde de trazo de pincel rosa, preparado para
insertar después la fotografía de un jabón.
Detalles de line art muy finos en las esquinas: mariposas y ramitas florales, en rosa claro.
Estilo delicado, femenino, artesanal, con mucho aire.
Sin texto, sin letras, sin logos.
```

---

## 7. Etiqueta y empaque (fase siguiente)

### 7.1 Mockup de etiqueta circular
```
Mockup fotográfico realista de una etiqueta adhesiva circular de 4 cm de diámetro pegada
sobre una pastilla de jabón artesanal translúcido de color verde jade.
La etiqueta es de papel mate blanco con un doble anillo rosa impreso y espacio circular
vacío en el centro (el logo se insertará después en edición).
Fotografía macro, luz suave de ventana, fondo crema desenfocado, mármol claro.
Muy alta resolución, realista. Sin texto en la etiqueta.
```

### 7.2 Mockup de caja
```
Mockup fotográfico de una caja pequeña de cartón kraft natural de 9x9x3 cm, cerrada,
sobre una superficie de mármol blanco, con una pastilla de jabón artesanal apoyada
diagonalmente contra ella. La cara superior de la caja está en blanco, lisa, lista para
insertar un diseño después.
Al lado, ramitas de romero y una flor seca rosada. Luz natural de ventana, sombras suaves,
paleta crema y rosa pálido. Formato 4:5, realista, alta resolución. Sin texto ni logos.
```

---

## 8. Prompt para vectorizar / limpiar el logo

El logo está en JPEG con fondo blanco. Para la web hace falta PNG transparente y SVG.

```
A partir de la imagen del logo que te doy, genera una versión limpia y vectorial:
sello circular con doble anillo rosa (#E88BB4), mariposa y flor en line art negro fino,
la palabra "MARI" en serif con versalitas en la parte superior del anillo, y la frase
"LIMPIEZA CON EL ALMA" en versalitas espaciadas siguiendo el arco inferior.
Fondo completamente transparente, líneas nítidas y limpias, bordes definidos, alta
resolución, estilo de logotipo profesional plano. Sin sombras, sin degradados, sin ruido.
```

> Después, para convertirlo a SVG de verdad: subir el PNG resultante a **vectorizer.ai** o **Adobe Express** (ambos con opción gratuita).

---

## 9. Checklist antes de dar una imagen por buena

- [ ] ¿La forma del jabón coincide con el producto real que se entrega?
- [ ] ¿El color es el verdadero, sin el tinte morado de las fotos originales?
- [ ] ¿Se ve la translucidez de la glicerina?
- [ ] ¿El fondo es crema limpio, sin tela arrugada?
- [ ] ¿La sombra es suave, no dura?
- [ ] ¿No hay texto inventado, letras raras ni logos deformes?
- [ ] ¿Está en 1:1 para catálogo o en el formato indicado?
- [ ] ¿Las seis fotos del catálogo se ven como una misma sesión de fotos?

**Nombres de archivo obligatorios** (el código los busca así):
```
web/public/productos/menta-romero-1.jpg     menta-romero-2.jpg
web/public/productos/arroz-1.jpg            arroz-2.jpg
web/public/productos/avena-1.jpg            avena-2.jpg
web/public/productos/arroz-avena-1.jpg      arroz-avena-2.jpg
web/public/productos/curcuma-miel-1.jpg     curcuma-miel-2.jpg
web/public/productos/naranja-coco-1.jpg     naranja-coco-2.jpg
web/public/hero-familia.jpg
web/public/hero-familia-movil.jpg
web/public/proceso-artesanal.jpg
```

**Antes de subirlas:** pásalas por [squoosh.app](https://squoosh.app) (gratis) y exporta a WebP con calidad 80. Bajan de ~3 MB a ~150 KB sin diferencia visible, y eso es la mitad de la nota de velocidad en Google.

---

## 10. Nota sobre honestidad comercial

Las imágenes generadas deben **representar el producto real**. Mejorar la luz, el fondo y la composición es fotografía profesional. Cambiar la forma, inventar colores que no existen o mostrar un empaque que no se entrega es publicidad engañosa: genera devoluciones, malas reseñas y, en Colombia, incumple el Estatuto del Consumidor (Ley 1480 de 2011). Por eso todo el método de esta guía parte de la foto real.
