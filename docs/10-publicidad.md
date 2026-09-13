# Piezas publicitarias con IA

Prompts para generar folletos, historias y publicaciones de Instagram con Gemini,
**incluyendo el texto**, a partir de las fotos de producto que ya tenemos.

---

## Lo que cambió

La guía anterior (`05-prompts-gemini.md`) decía que el texto de los folletos se montara aparte,
porque los modelos escribían mal en español: devolvían "BENEFICOS", comían tildes y deformaban
letras. **Eso ya no es así.** Los modelos de imagen actuales renderizan texto correctamente,
tildes y eñes incluidas, si se les dice exactamente qué escribir.

Así que el método cambia: ahora se genera la pieza completa de una vez. Lo que sigue valiendo es
la regla de fondo — **partir siempre de la foto real del producto**, para no anunciar un jabón
que no existe.

---

## Cómo trabajar

**Herramienta:** [Google AI Studio](https://aistudio.google.com) o la app de Gemini, con
generación de imagen. Gratis con cuota diaria.

**El flujo de cada pieza:**

1. Sube la foto del producto. Están en `web/public/productos/` y también en línea:
   `https://jabonesmari.shop/productos/menta-romero-1.jpg`
2. Pega el **bloque de marca** (sección 1) + el **prompt de la pieza** (secciones 3 en adelante).
3. Genera. Revisa **letra por letra** que el texto esté bien escrito.
4. Si algo falla, corrige conversando: *"el precio dice 7.50, debe decir $7.500"*.

**Tres reglas que evitan el 90% de los problemas:**

- **Escribe el texto entre comillas** en el prompt. Lo que va entre comillas es lo que debe
  aparecer, exacto.
- **Poco texto por pieza.** Cuanto más texto pides, más probable es un error. Seis beneficios
  cortos funcionan; párrafos, no.
- **Revisa siempre las tildes.** Es lo primero que se pierde: *Cúrcuma*, *cítrico*, *pequeño*.

---

## 1. Bloque de marca (va al inicio de CADA pieza)

```
Eres diseñador gráfico de una marca de cosmética natural artesanal colombiana.

MARCA: "Mari" — jabones artesanales hechos a mano en Bogotá.
Lema: "Limpieza con el alma".

PALETA (usa exactamente estos colores):
- Fondo crema cálido: #FCF8F4
- Rosa de marca: #E07FAE
- Rosa profundo (para texto sobre rosa claro): #B14372
- Rosa muy suave: #FBE8F1
- Tinta (texto principal, no negro puro): #2E2328

TIPOGRAFÍA:
- Títulos: serif elegante de alto contraste, con carácter editorial.
- Textos y datos: sans serif limpia y muy legible.
- Etiquetas cortas: mayúsculas con bastante espaciado entre letras.

ESTILO: femenino, cálido y artesanal, pero cuidado y adulto. Nada infantil, nada de
purpurina, nada de degradados chillones. Mucho aire alrededor de los elementos.

ELEMENTO GRÁFICO: trazos de pincel de bordes irregulares, como manchas de acuarela
con el borde vivo. Es el sello visual de la marca y debe aparecer en todas las piezas.

IDIOMA: español de Colombia. Respeta TODAS las tildes y la letra ñ. Revisa la
ortografía antes de dibujar el texto: "Cúrcuma", "cítrico", "pequeño", "artesanal".

REGLA: no inventes texto que no te haya pedido. No agregues logotipos ni marcas de agua
que no estén en estas instrucciones.
```

---

## 2. La plantilla del folleto de producto

Estructura calcada de las referencias que funcionan, con nuestra identidad:

```
┌─────────────────────────────┐
│   FOTO DEL JABÓN            │  ← con marco de trazo de pincel
│   (mitad superior)          │
├─────────────────────────────┤
│      NOMBRE DEL JABÓN       │  ← banda de color de la receta
│  Piel: X · Uso: Y · Peso    │  ← franja de datos
├─────────────────────────────┤
│        BENEFICIOS           │
│  ✓ uno        ✓ cuatro      │
│  ✓ dos        ✓ cinco       │
│  ✓ tres       ✓ seis        │
├─────────────────────────────┤
│ Grande $7.500 · Peq. $5.000 │
│ jabonesmari.shop            │
└─────────────────────────────┘
```

### Prompt de la plantilla

```
Diseña un folleto publicitario cuadrado (1080x1080) para Instagram con esta estructura
exacta, de arriba hacia abajo:

1. MITAD SUPERIOR: la fotografía del jabón que te di, recortada dentro de un marco con
   borde de trazo de pincel irregular. Que se vea grande y protagonista.

2. BANDA DEL NOMBRE: una banda horizontal de trazo de pincel en color [COLOR_RECETA],
   con el nombre "[NOMBRE]" centrado, en mayúsculas, tipografía serif, en blanco.

3. FRANJA DE DATOS: sobre fondo crema, en una sola línea y en sans serif:
   "Tipo de piel: [PIEL]    Uso: [USO]"

4. BLOQUE DE BENEFICIOS: encabezado "BENEFICIOS" centrado sobre una banda de pincel en
   [COLOR_RECETA]. Debajo, seis beneficios en dos columnas de tres, cada uno precedido
   por un check ✓ en el mismo color:

   [BENEFICIO 1]          [BENEFICIO 4]
   [BENEFICIO 2]          [BENEFICIO 5]
   [BENEFICIO 3]          [BENEFICIO 6]

5. PIE: sobre fondo crema, dos líneas centradas:
   "Grande $7.500  ·  Pequeño $5.000"
   "jabonesmari.shop  ·  WhatsApp 321 288 1565"

Deja un espacio limpio en la esquina superior derecha para colocar el logotipo después.
El texto debe ser nítido, perfectamente legible y sin faltas de ortografía.
```

---

## 3. Los seis folletos, listos para copiar

Toma el bloque de marca + la plantilla y reemplaza los valores. Aquí están los seis, con el
texto exacto del catálogo.

### 3.1 Menta y Romero

*Sube:* `menta-romero-1.jpg`

```
[NOMBRE]        MENTA Y ROMERO
[COLOR_RECETA]  verde salvia profundo #4F6B4D
[PIEL]          Mixta y grasa
[USO]           Corporal

[BENEFICIO 1]   Refresca y revitaliza
[BENEFICIO 2]   Ayuda a controlar la grasa
[BENEFICIO 3]   Purificante natural
[BENEFICIO 4]   Sensación descongestionante
[BENEFICIO 5]   Alivia la fatiga de los pies
[BENEFICIO 6]   Aroma herbal energizante
```

### 3.2 Arroz

*Sube:* `arroz-1.jpg`

```
[NOMBRE]        ARROZ
[COLOR_RECETA]  arena tostada #856A44
[PIEL]          Todo tipo de piel
[USO]           Facial y corporal

[BENEFICIO 1]   Ayuda a unificar el tono
[BENEFICIO 2]   Aporta luminosidad
[BENEFICIO 3]   Suaviza la textura
[BENEFICIO 4]   Antioxidante natural
[BENEFICIO 5]   Minimiza los poros
[BENEFICIO 6]   Limpia sin resecar
```

### 3.3 Avena

*Sube:* `avena-1.jpg`

```
[NOMBRE]        AVENA
[COLOR_RECETA]  avena tostada #8A6836
[PIEL]          Seca y sensible
[USO]           Facial y corporal

[BENEFICIO 1]   Exfoliación suave
[BENEFICIO 2]   Calma la piel irritada
[BENEFICIO 3]   Alivia la resequedad
[BENEFICIO 4]   Hidratación natural
[BENEFICIO 5]   Apto para piel sensible
[BENEFICIO 6]   Limpia sin agredir
```

### 3.4 Arroz y Avena

*Sube:* `arroz-avena-1.jpg`

```
[NOMBRE]        ARROZ Y AVENA
[COLOR_RECETA]  beige cálido #86653F
[PIEL]          Todo tipo, incluso sensible
[USO]           Facial y corporal

[BENEFICIO 1]   Exfoliación delicada
[BENEFICIO 2]   Ayuda a unificar el tono
[BENEFICIO 3]   Suaviza y calma a la vez
[BENEFICIO 4]   Aporta luminosidad
[BENEFICIO 5]   Ideal para piel sensible
[BENEFICIO 6]   Deja la piel tersa
```

### 3.5 Cúrcuma y Miel

*Sube:* `curcuma-miel-1.jpg`

```
[NOMBRE]        CÚRCUMA Y MIEL
[COLOR_RECETA]  dorado profundo #8A6410
[PIEL]          Mixta y grasa
[USO]           Facial

[BENEFICIO 1]   Calma las imperfecciones
[BENEFICIO 2]   Antioxidante natural
[BENEFICIO 3]   Aporta luminosidad
[BENEFICIO 4]   La miel humecta
[BENEFICIO 5]   Piel más uniforme
[BENEFICIO 6]   Sensación suave y tersa
```

> Ojo con la tilde de **Cúrcuma**. Es la palabra que más se equivoca.

### 3.6 Naranja y Aceite de Coco

*Sube:* `naranja-coco-1.jpg`

```
[NOMBRE]        NARANJA Y COCO
[COLOR_RECETA]  naranja terracota #A9541B
[PIEL]          Seca y normal
[USO]           Facial y corporal

[BENEFICIO 1]   Vitamina C que ilumina
[BENEFICIO 2]   Hidratación profunda
[BENEFICIO 3]   Antioxidante natural
[BENEFICIO 4]   Tonifica y revitaliza
[BENEFICIO 5]   Aroma cítrico que anima
[BENEFICIO 6]   Nutre sin dejar grasa
```

---

## 4. Ejemplo completo, ya ensamblado

Para que se vea cómo queda todo junto. Este se copia y se pega tal cual, subiendo
`avena-1.jpg`:

```
Eres diseñador gráfico de una marca de cosmética natural artesanal colombiana.

MARCA: "Mari" — jabones artesanales hechos a mano en Bogotá.
Lema: "Limpieza con el alma".

PALETA: fondo crema cálido #FCF8F4, rosa de marca #E07FAE, rosa profundo #B14372,
tinta #2E2328. Color de esta receta: avena tostada #8A6836.

TIPOGRAFÍA: títulos en serif elegante de alto contraste; textos en sans serif limpia;
etiquetas en mayúsculas espaciadas.

ESTILO: femenino, cálido y artesanal, pero adulto y cuidado. Mucho aire. Trazos de
pincel de bordes irregulares como sello visual.

IDIOMA: español de Colombia, con todas las tildes correctas.

Diseña un folleto cuadrado 1080x1080 para Instagram con esta estructura:

1. MITAD SUPERIOR: la fotografía del jabón que te di, dentro de un marco con borde de
   trazo de pincel irregular.

2. BANDA con el nombre "AVENA" centrado, en mayúsculas serif blancas, sobre un trazo
   de pincel color #8A6836.

3. FRANJA sobre fondo crema, en una línea:
   "Tipo de piel: Seca y sensible    Uso: Facial y corporal"

4. BLOQUE con el encabezado "BENEFICIOS" sobre una banda de pincel #8A6836, y debajo
   seis beneficios en dos columnas de tres, cada uno con un check ✓ del mismo color:

   ✓ Exfoliación suave          ✓ Hidratación natural
   ✓ Calma la piel irritada     ✓ Apto para piel sensible
   ✓ Alivia la resequedad       ✓ Limpia sin agredir

5. PIE centrado, dos líneas:
   "Grande $7.500  ·  Pequeño $5.000"
   "jabonesmari.shop  ·  WhatsApp 321 288 1565"

Deja limpia la esquina superior derecha para el logotipo. Texto nítido, legible y sin
faltas de ortografía.
```

---

## 5. Historias de Instagram (1080x1920)

### 5.1 Historia de producto

*Sube la foto del jabón.*

```
Diseña una historia vertical de Instagram (1080x1920) para la marca Mari.

COMPOSICIÓN:
- Fondo crema #FCF8F4 con una gran mancha de acuarela rosa muy suave #FBE8F1 que ocupa
  la parte superior, con el borde irregular.
- En el tercio superior, el título en serif grande: "[CLAIM]"
- En el centro, la fotografía del jabón dentro de un círculo con borde de pincel rosa.
- Debajo, tres beneficios cortos, uno por línea, centrados, con un punto rosa antes de
  cada uno:
  "[BENEFICIO 1]"
  "[BENEFICIO 2]"
  "[BENEFICIO 3]"
- En el tercio inferior, una banda de pincel rosa #E07FAE con el texto blanco:
  "Desde $5.000"
- Al fondo del todo: "jabonesmari.shop"
- Deja libre el 15% inferior de la imagen: ahí va el sticker del enlace.

Mucho aire, elegante, sin recargar. Texto perfectamente escrito en español con tildes.
```

Los claims de cada uno: *Despierta tu piel* (menta y romero), *Luz pareja* (arroz),
*Calma y abraza* (avena), *Exfolia e ilumina* (arroz y avena), *Equilibrio y brillo*
(cúrcuma y miel), *Energía cítrica* (naranja y coco).

### 5.2 Historia de "ya estamos en línea"

*Sube:* `hero-familia.jpg`

```
Diseña una historia vertical de Instagram (1080x1920) para anunciar el lanzamiento de
una tienda en línea.

- Fondo crema #FCF8F4.
- Arriba, en serif grande y en dos líneas:
  "Ya tenemos"
  "tienda en línea"
  La segunda línea en cursiva y en color rosa profundo #B14372.
- En el centro, la fotografía que te di, dentro de un marco de trazo de pincel.
- Debajo, en sans serif:
  "Mira el catálogo completo, arma tu pedido
  y lo confirmamos por WhatsApp."
- Abajo, una banda de pincel rosa #E07FAE con texto blanco en mayúsculas espaciadas:
  "JABONESMARI.SHOP"
- Deja libre el 15% inferior para el sticker del enlace.

Aire, elegancia, cero saturación. Español con tildes correctas.
```

---

## 6. Publicación de combos y regalo

*Sube:* `detalle-regalo.jpg`

```
Diseña una publicación cuadrada 1080x1080 para Instagram.

- Fondo crema #FCF8F4 con trazos de pincel rosa suave #FBE8F1 en las esquinas.
- Arriba, título en serif grande y centrado: "Un detalle que se recuerda"
- En el centro, la fotografía que te di, dentro de un marco de pincel rosa.
- Debajo, tres líneas centradas en sans serif, cada una con un corazón pequeño rosa:
  "Elige tus recetas favoritas"
  "Bolsa de organza y cinta"
  "Tarjeta para tu dedicatoria"
- Al pie, sobre una banda de pincel rosa #E07FAE, texto blanco:
  "Cotiza por WhatsApp · 321 288 1565"

Delicado, femenino, elegante. Español con tildes.
```

---

## 7. Carrusel: "¿Cuál es tu jabón?"

Cinco imágenes cuadradas que se generan una por una con el mismo estilo. Es el contenido que
más se guarda y comparte, porque ayuda a decidir.

**Lámina 1 — portada.** *Sube:* `hero-familia.jpg`

```
Publicación cuadrada 1080x1080, fondo crema #FCF8F4.
Arriba, en serif muy grande, centrado y en tres líneas:
"¿Cuál es"
"tu jabón?"
La segunda línea en cursiva, color rosa profundo #B14372.
Debajo, la foto que te di dentro de un marco de pincel.
Al pie, en mayúsculas espaciadas color tinta: "DESLIZA PARA ENCONTRARLO"
Con una flecha pequeña rosa apuntando a la derecha.
```

**Láminas 2 a 5 — un tipo de piel por lámina.** Repite este prompt cambiando los valores:

```
Publicación cuadrada 1080x1080, fondo crema #FCF8F4, mismo estilo de marca.
Arriba, sobre una banda de trazo de pincel en [COLOR], en serif blanco: "[TITULAR]"
En el centro, la fotografía del jabón que te di, en un círculo con borde de pincel.
Debajo, en serif color tinta y grande: "[NOMBRE DEL JABÓN]"
Y una frase en sans serif, centrada: "[FRASE]"
Al pie, pequeño: "jabonesmari.shop"
```

| Lámina | [TITULAR] | Foto | [NOMBRE] | [COLOR] | [FRASE] |
|---|---|---|---|---|---|
| 2 | SI TU PIEL SE IRRITA | `avena-1.jpg` | Avena | `#8A6836` | Calma, exfolia suave y no agrede. |
| 3 | SI SE TE BRILLA LA CARA | `curcuma-miel-1.jpg` | Cúrcuma y Miel | `#8A6410` | Equilibra sin resecar. |
| 4 | SI LA VES OPACA | `arroz-1.jpg` | Arroz | `#856A44` | Ilumina y empareja el tono. |
| 5 | SI LA SIENTES SECA | `naranja-coco-1.jpg` | Naranja y Coco | `#A9541B` | Nutre en profundidad, sin dejar grasa. |

**Lámina 6 — cierre.**

```
Publicación cuadrada 1080x1080, fondo rosa muy suave #FBE8F1.
En el centro, en serif grande color rosa profundo #B14372 y en dos líneas:
"Hechos a mano"
"en Bogotá"
Debajo, en sans serif color tinta:
"Seis recetas · Desde $5.000 · Domicilio en Bogotá"
Al pie, banda de pincel rosa #E07FAE con texto blanco en mayúsculas espaciadas:
"JABONESMARI.SHOP"
Mucho aire, minimalista, elegante.
```

---

## 8. Foto de portada y perfil

**Perfil de WhatsApp Business e Instagram:** usa el logotipo tal cual
(`brand/logo/logo-mari.jpeg`). No lo generes con IA: el de la marca ya existe.

**Portada de Facebook / encabezado (1640x624):**

```
Diseña un encabezado horizontal de 1640x624 para una marca de jabones artesanales.
- Fondo crema #FCF8F4 con trazos de pincel rosa suave en los extremos.
- A la izquierda, en serif grande: "Jabones Mari" y debajo, en mayúsculas espaciadas
  color rosa profundo: "LIMPIEZA CON EL ALMA"
- A la derecha, la fotografía de los jabones que te di, con marco de pincel.
- Abajo a la izquierda, pequeño: "Hecho a mano en Bogotá · jabonesmari.shop"
Elegante, con mucho aire. Español con tildes.
```

---

## 9. Antes de publicar: revisión

Sobre la pieza generada, comprueba:

- [ ] **Cada palabra está bien escrita.** Léela en voz alta. Especial cuidado con *Cúrcuma*,
      *cítrico*, *pequeño*, *Exfoliación*, *Hidratación*.
- [ ] **Los precios son los de hoy.** Si cambiaron en el panel, la pieza queda vieja.
- [ ] **El WhatsApp es correcto:** 321 288 1565.
- [ ] **La dirección web dice** `jabonesmari.shop`, sin errores.
- [ ] **El jabón de la foto es el real**, con su forma y su color.
- [ ] **El texto se lee en el celular** sin ampliar. Míralo al tamaño de una miniatura.
- [ ] **Hay contraste suficiente** entre el texto y el fondo.
- [ ] **Los seis beneficios coinciden** con los de la ficha del producto en la web.

Y al final: **pon el logotipo real** encima, en la esquina que dejaste libre. El logo no se
genera nunca con IA — se usa el de la marca.

---

## 10. Si el texto sale mal

| Problema | Qué hacer |
|---|---|
| Falta una tilde | *"Corrige: dice 'Curcuma', debe decir 'Cúrcuma' con tilde en la u."* |
| Una palabra inventada | *"Quita el texto que dice X. Solo debe aparecer lo que te indiqué."* |
| El precio se deforma | Pídelo aparte: *"El precio debe decir exactamente: Grande $7.500"* |
| Texto amontonado | Reduce: deja tres beneficios en vez de seis, o sube el tamaño del lienzo |
| Sale en inglés | *"Todo el texto debe estar en español de Colombia."* |
| El color no coincide | Repite el código: *"La banda debe ser exactamente #8A6836."* |

Si tras dos o tres intentos una pieza no sale, **genera solo el fondo sin texto** y móntalo en
[Canva](https://canva.com), que es gratis. Vale más media hora en Canva que veinte generaciones
peleando con una palabra.

---

## 11. Calendario de publicación sugerido

Con estas piezas hay contenido para el primer mes:

| Semana | Qué publicar |
|---|---|
| 1 | Historia de lanzamiento + folletos de los dos jabones más vendidos |
| 2 | Carrusel "¿Cuál es tu jabón?" + folleto de un tercer jabón |
| 3 | Publicación de combos y regalo + historia de producto |
| 4 | Folletos de los jabones restantes + foto del proceso artesanal |

Publica los folletos también en **estados de WhatsApp**: ahí están las clientas que ya compraron,
que son las que más vuelven a comprar.

> La foto del proceso (`proceso-artesanal.jpg`) no necesita folleto: se publica tal cual con un
> texto en el pie. Lo hecho a mano se vende solo mostrando las manos.
