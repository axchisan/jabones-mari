# Avisos de pedidos

Cómo se entera el negocio de que entró un pedido, y cómo activar los dos canales.

---

## El problema que resuelven

El pedido se guarda en la base **antes** de abrir WhatsApp. Eso es a propósito: si la clienta se
arrepiente o el chat no abre, el pedido no se pierde.

Pero tiene una consecuencia. Si la clienta confirma en la web y **no llega a enviar** el mensaje
de WhatsApp, el pedido queda registrado y **en silencio**. Nadie se entera hasta que alguien abre
el panel por casualidad.

Los avisos cierran ese hueco.

---

## Dos canales, a propósito

| | Notificación push | Correo |
|---|---|---|
| Llega en | Segundos | Segundos |
| Dónde | Al celular, como cualquier notificación | A la bandeja de entrada |
| Requiere | Panel instalado como aplicación y permiso concedido | Nada del lado de quien recibe |
| Si el celular está apagado | Llega al encenderlo | Ya está en el correo |
| Deja registro | No | Sí, consultable y buscable |
| Costo | $0 | $0 hasta 3.000 correos al mes |

No sobra tener los dos: el push es inmediato y cómodo; el correo es el que nunca falla y deja
rastro.

---

## 1. Notificaciones push — ya funcionan

No hay que configurar nada en el servidor: las claves ya están puestas. Solo hay que activarlas
**en cada dispositivo** donde se quieran recibir.

### En el celular (lo importante)

1. Abre `jabonesmari.shop/admin` en **Chrome** (Android) o **Safari** (iPhone).
2. Menú del navegador → **Instalar aplicación** / **Añadir a pantalla de inicio**.

   > ⚠️ En iPhone este paso **no es opcional**: Apple solo permite notificaciones web si la
   > aplicación está instalada en la pantalla de inicio.

3. Abre el panel desde el ícono nuevo.
4. En *Resumen*, pulsa **Activar avisos** y acepta el permiso.
5. Pulsa **Probar**. Debe llegar una notificación en el momento.

### Qué se ve al entrar un pedido

> **Pedido nuevo · $20.000**
> Laura Gómez pidió 4 jabones. Código MARI-0007.

Al tocarla, abre directamente ese pedido en el panel.

### Si algo no funciona

| Lo que pasa | Por qué |
|---|---|
| No aparece el botón *Activar avisos* | El navegador no admite notificaciones. Usa Chrome en Android o Safari en iPhone. |
| Dice que están bloqueadas | Se rechazó el permiso antes. Hay que habilitarlo en los ajustes del sitio en el navegador. |
| En iPhone no llega nada | Falta instalar el panel como aplicación. Es requisito de Apple. |
| Dejaron de llegar de golpe | El navegador caducó la suscripción. Desactiva y vuelve a activar. |

---

## 2. Correo — ya funciona

> ✅ **Configurado y probado.** El dominio `jabonesmari.shop` está verificado en Resend
> (DKIM y los dos CNAME de SPF propagados), y un pedido de prueba entregó los dos correos:
> el aviso al negocio y la confirmación a la clienta. La baja también quedó comprobada.

Lo que sigue queda como referencia, por si hay que rehacerlo o cambiar el destinatario.

### Paso 1 · Crear la clave de Resend

1. Entra a [resend.com](https://resend.com) y accede con la cuenta del proyecto.
2. Ve a **API Keys** → **Create API Key**.
3. Nombre: `jabones-mari`. Permiso: **Sending access**.
4. Copia la clave (empieza por `re_`). Solo se muestra una vez.

### Paso 2 · Verificar el dominio

Para que el correo salga desde `pedidos@jabonesmari.shop` hay que demostrar que el dominio es
nuestro.

1. En Resend → **Domains** → **Add Domain** → `jabonesmari.shop`.
2. Resend muestra unos registros DNS (`MX`, `TXT` de SPF y `TXT` de DKIM).
3. Agrégalos en **Hostinger → Dominios → jabonesmari.shop → DNS / Nameservers**.
4. Vuelve a Resend y pulsa **Verify**. Tarda unos minutos.

> **Sin verificar el dominio no se puede enviar** a cualquier destinatario: la dirección de
> pruebas `onboarding@resend.dev` solo entrega al correo de la propia cuenta de Resend.

### Paso 3 · Poner las variables

En `web/.env.local`:

```bash
RESEND_API_KEY=re_tu_clave_aqui
RESEND_FROM=Jabones Mari <pedidos@jabonesmari.shop>
NOTIFICAR_A=correo@ejemplo.com
```

`NOTIFICAR_A` admite varios correos separados por coma, por si quieren enterarse los dos:

```bash
NOTIFICAR_A=tia@ejemplo.com,sobrino@ejemplo.com
```

### Paso 4 · Subirlas y desplegar

```bash
cd web
node scripts/subir-variables.mjs
git commit --allow-empty -m "Activa los avisos por correo" && git push
```

### Paso 5 · Probar

En el panel, en *Resumen*, aparece el botón **Probar correo**. Si llega, está listo.

### Cambiar a quién le llega

`NOTIFICAR_A` es la única variable que hay que tocar para eso. Hoy apunta a
`axchisan923@gmail.com`; cuando la tía tenga su correo listo, se agrega separado por coma:

```bash
NOTIFICAR_A=axchisan923@gmail.com,tia@ejemplo.com
```

Luego `node scripts/subir-variables.mjs` y un push.

### El registro DMARC, que quedó pendiente

Resend lo marca como opcional y el correo sale igual sin él, pero **mejora la entrega**: le
dice a Gmail y Outlook qué hacer con los correos que dicen venir del dominio y no pasan las
comprobaciones.

En Hostinger, agrega un registro más:

| Tipo | Nombre | Contenido |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

`p=none` solo observa, no rechaza nada: es el ajuste correcto para empezar.

---

## Qué trae el correo

Asunto: `Pedido nuevo MARI-0007 · $20.000`

Dentro: el código, la lista de productos con cantidades y precios, el total, los datos de entrega,
la nota de la clienta, y dos botones — **Ver el pedido** en el panel y **Escribirle** por WhatsApp.

Está maquetado con la identidad de la marca y se ve bien tanto en el celular como en el
computador.

---

## Detalles de cómo está hecho

- **Los avisos nunca retrasan la respuesta.** Se lanzan sin esperar: si el push o el correo
  fallan, el pedido ya está guardado y se ve igual en el panel. Una notificación caída no puede
  costar una venta.
- **Las suscripciones caducadas se borran solas.** Cuando un navegador responde que el
  dispositivo ya no existe, esa suscripción se elimina en vez de quedar acumulando basura.
- **Los correos llevan clave de idempotencia.** Si la petición se reintenta, no llegan dos correos
  del mismo pedido.
- **Push usa VAPID**, sin intermediarios: los avisos salen del propio servidor hacia el navegador,
  sin pasar por servicios de terceros que puedan cobrar o cerrar.

---

## Lo que podría venir después

**Aviso por WhatsApp.** Sería lo ideal —llega donde la dueña ya vive— pero requiere la
WhatsApp Business API de Meta, que exige un número dedicado que no puede usarse en la aplicación
normal. Justo lo que no queremos (ver `12-whatsapp-business.md`). Se retoma si algún día el
volumen lo justifica.

**Resumen diario.** Un correo cada noche con los pedidos del día y lo que quedó sin atender.
Fácil de añadir con una tarea programada de Vercel cuando haya suficiente movimiento.
