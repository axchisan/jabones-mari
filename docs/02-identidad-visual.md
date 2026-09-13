# Identidad visual — Mari

## 1. Diagnóstico del material actual

**Logo definitivo** (`Logos/Logo definitivo.jpeg`): sello circular, doble anillo rosa, mariposa y flor en *line art* negro, "MARI" en serif con versalitas, tagline "LIMPIEZA CON EL ALMA" en el arco inferior, corazones y destellos.
→ Es el correcto. Es más limpio, más adulto y escala mejor que el anterior. El line art aguanta reducirse a 32 px (favicon) sin convertirse en mancha.

**Logo anterior** (`Logos/Logo ya usado en algunos jabones.jpeg`): mariposa ilustrada con relleno, "Mari" en script, corona. Se satura al reducirlo y el script pierde legibilidad.
→ Se retira del sitio, pero **seguirá apareciendo en las fotos de los jabones ya producidos**. No es un problema: es la etiqueta de las primeras tandas y refuerza el relato artesanal. En las imágenes nuevas generadas con IA usaremos el definitivo.

**Fotos actuales**: el problema no es el producto — los jabones son bonitos, translúcidos, con flores incrustadas y formas de corazón. El problema es técnico:
- luz artificial morada que tiñe todo y falsea el color real (el jabón de arroz se ve lila, no perla);
- fondo de tela arrugada que compite con el producto;
- sombra dura del celular;
- encuadre descentrado y etiqueta a veces al revés (ej. naranja grande).

→ No se descartan: sirven como **referencia de forma, color y textura** para el trabajo con IA (ver `05-prompts-gemini.md`). La forma de corazón, el veteado de la cúrcuma y los trocitos de naranja son señas de identidad que hay que conservar.

---

## 2. Posicionamiento y tono

**Lo que vende este producto no es jabón: es cuidado hecho a mano.**

| Eje | Decisión |
|---|---|
| Territorio | Cosmética natural artesanal, femenina, cálida, cercana. |
| No es | Clínica/dermatológica, ni minimalista fría, ni "spa de lujo". |
| Tono de voz | Tutea, es cálido y honesto. "Hecho a mano, en casa, para tu piel." Nunca promete curas médicas. |
| Palabras clave | artesanal · natural · hecho a mano · sin químicos agresivos · glicerina · piel sensible |
| Palabras prohibidas | "cura", "elimina el acné", "medicinal", "trata la enfermedad" (riesgo legal y de credibilidad). |

---

## 3. Paleta

El rosa del logo es el ancla, pero un sitio 100% rosa se lee infantil y cansa la vista. La solución: **rosa como acento de marca sobre base crema, con verde salvia como color de "natural"**.

```
--rosa-marca     #E88BB4   Botones, acentos, sello
--rosa-profundo  #C2547F   Texto sobre rosa claro, hover, precios (contraste AA)
--rosa-suave     #FBE4EE   Fondos de sección, chips, badges
--rosa-niebla    #FDF2F7   Fondo alterno muy claro

--crema          #FDF9F5   Fondo principal del sitio
--arena          #F2E8DE   Bordes suaves, tarjetas

--salvia         #7E9A7C   Etiquetas "natural", iconos de ingrediente
--salvia-clara   #DCE6D9   Fondos de bloques de beneficios

--tinta          #3A2B30   Texto principal (no negro puro: negro puro es duro)
--tinta-suave    #6E5B62   Texto secundario

--dorado         #C9A227   Detalle de "miel", estrellas de reseñas
```

**Reglas:**
- El fondo del sitio es **crema**, no blanco puro. Da calidez y hace ver el rosa más elegante.
- Un solo color de acento por pantalla. El rosa es para la acción principal (Agregar al carrito, Pedir por WhatsApp).
- El verde salvia jamás compite con el rosa: se usa en elementos informativos (beneficios, ingredientes).
- WhatsApp conserva su verde oficial `#25D366` en el botón flotante. Es un código que la gente reconoce, no lo pintamos de rosa.
- Contraste mínimo AA (4.5:1) en todo texto. `--rosa-marca` **no** se usa para texto pequeño sobre crema; para eso está `--rosa-profundo`.

---

## 4. Tipografía

| Uso | Fuente | Por qué |
|---|---|---|
| Titulares y nombre de producto | **Fraunces** (Google Fonts, variable) | Serif contemporánea con eje "soft/wonky"; tiene calidez artesanal sin parecer boda de 2014. Conversa con el serif del logo. |
| Texto, UI, precios | **Inter** (Google Fonts, variable) | Neutra, altísima legibilidad en móvil, números tabulares para precios. |
| Detalles (tagline, etiquetas) | Inter en versalitas con `letter-spacing: 0.18em` | Recrea el tratamiento del arco "LIMPIEZA CON EL ALMA". |

Alternativa si Fraunces se ve muy marcada: **Playfair Display** (más clásica) o **Marcellus** (más lapidaria).
Ambas se cargan con `next/font/google`, que las autohospeda: cero llamadas a Google en producción y cero impacto en LCP.

---

## 5. Sistema visual

- **Formas:** radios generosos (`16px` en tarjetas, `999px` en botones y chips). El producto es curvo y jabonoso; la interfaz lo acompaña.
- **Tarjetas de producto:** foto cuadrada 1:1 sobre fondo crema, nombre en Fraunces, chips de beneficio en salvia, precio en Inter semibold, botón rosa de ancho completo.
- **Sombras:** suaves y rosadas (`0 8px 24px rgba(200,84,127,.08)`), nunca grises duras.
- **Elemento gráfico recurrente:** el **trazo de pincel** de las referencias (la mancha con borde irregular). Es lo que da unidad al folleto y lo reutilizamos en la web como separador de secciones y fondo de titulares.
- **Iconografía:** line art de un solo trazo, coherente con la mariposa del logo. Hoja, gota, flor, panal, rodaja de cítrico.
- **Fotografía:** siempre fondo crema o mármol claro, luz de ventana suave, sombra larga y difusa, un ingrediente real junto al jabón (ramita de romero, granos de arroz, rodaja de naranja).

---

## 6. Reglas de uso del logo

- Espacio libre alrededor: mínimo el 15% del diámetro del sello.
- Tamaño mínimo: 40 px en pantalla, 15 mm impreso.
- Sobre fondo crema o blanco. Nunca sobre foto sin una pastilla de fondo detrás.
- No rotarlo, no estirarlo, no cambiarle el color, no ponerle sombra.
- **Tarea pendiente:** convertir el logo a **SVG**. Hoy es un JPEG con fondo blanco; en SVG tendrá fondo transparente, pesará ~8 KB y se verá nítido en cualquier pantalla. (Se puede hacer gratis en vectorizer.ai / Adobe Express, o rehacerlo a mano en Figma.)

---

## 7. Aplicación a los folletos

Las referencias del otro emprendimiento (Karité, Aloe Vera, Miel y Vitamina E) funcionan porque son **una plantilla rígida con color variable**:

1. Foto del producto arriba, recortada con borde de pincel.
2. Banda con el nombre del producto.
3. Banda con la ficha: `Tipo de piel · Peso · Uso`.
4. Bloque "BENEFICIOS" con seis ítems en dos columnas, cada uno con un check.
5. Color de fondo temático según el ingrediente.

Adoptamos **la misma estructura** (funciona, es legible en el feed de Instagram y se lee en 3 segundos) pero con nuestra identidad: crema de base, banda rosa, y un color de acento por receta:

| Receta | Color de acento del folleto |
|---|---|
| Menta y romero | Verde salvia `#7E9A7C` |
| Arroz | Perla / arena `#D9C7B4` |
| Avena | Avena tostada `#C9A87C` |
| Arroz y avena | Beige cálido `#D6B99A` |
| Cúrcuma y miel | Dorado `#C9A227` |
| Naranja y coco | Naranja suave `#E08A4B` |

Y siempre: logo definitivo arriba a la derecha, precio y WhatsApp abajo.
