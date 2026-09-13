# Configurar el ingreso con Google

> Tiempo estimado: 10 minutos. Es gratis y no pide tarjeta.
> Al terminar tendrás dos valores que van en `web/.env.local`:
> `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

Mientras esas dos variables estén vacías, **el botón "Continuar con Google" simplemente no aparece**
y el ingreso por correo y contraseña sigue funcionando. No se rompe nada por dejarlo para después.

---

## Paso 1 · Crear el proyecto en Google Cloud

1. Entra a [console.cloud.google.com](https://console.cloud.google.com) con la cuenta de Google del
   negocio (la misma que administra el panel).
2. Arriba a la izquierda, junto al logo, hay un selector de proyectos. Ábrelo y elige
   **Proyecto nuevo**.
3. Nombre del proyecto: `Jabones Mari`. Deja la organización como esté.
4. **Crear**. Espera unos segundos y asegúrate de que el selector de arriba ya diga
   *Jabones Mari* — si sigue en otro proyecto, los pasos siguientes se aplicarán al equivocado.

---

## Paso 2 · Configurar la pantalla de consentimiento

Es la ventana que verá la clienta cuando pulse "Continuar con Google".

1. En el buscador de arriba escribe **"Google Auth Platform"** y entra.
2. Pulsa **Comenzar**.
3. Llena así:

   | Campo | Qué poner |
   |---|---|
   | Nombre de la aplicación | `Jabones Mari` |
   | Correo de asistencia | el correo del negocio |
   | Público / Audience | **Externo** |
   | Datos de contacto | el correo del negocio |

4. Acepta la política de datos de usuario de Google y pulsa **Crear**.

> **Sobre el modo de prueba:** al crearla, la aplicación queda "En prueba", y en ese estado solo
> pueden entrar los correos que agregues a mano como usuarios de prueba. Para que entre cualquier
> clienta hay que publicarla — eso es el **Paso 5**.

---

## Paso 3 · Crear las credenciales

1. En el menú lateral entra a **Clientes** (o *Credenciales*) y pulsa **Crear cliente**.
2. Tipo de aplicación: **Aplicación web**.
3. Nombre: `Jabones Mari — web`.
4. En **Orígenes autorizados de JavaScript**, agrega estas dos, una por una:

   ```
   http://localhost:3000
   https://jabonesmari.shop
   ```

5. En **URI de redireccionamiento autorizados**, agrega estas dos:

   ```
   http://localhost:3000/api/auth/callback/google
   https://jabonesmari.shop/api/auth/callback/google
   ```

   > ⚠️ Tienen que ser **idénticas**, carácter por carácter. Sin barra `/` al final, con `https` en
   > la de producción y `http` en la local. Si no coinciden exactamente, Google responde
   > `redirect_uri_mismatch` y el ingreso falla.

6. **Crear**. Google muestra una ventana con el **ID de cliente** y el **Secreto de cliente**.
   Cópialos ya: el secreto solo se puede volver a ver descargándolo.

---

## Paso 4 · Pegarlos en el proyecto

Abre `web/.env.local` y completa las dos líneas que ya están ahí esperando:

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-secreto-aqui
```

Guarda y reinicia el servidor (`Ctrl+C` y `npm run dev`). El botón de Google aparecerá solo.

**En producción**, súbelas con:

```bash
cd web && node scripts/subir-variables.mjs
```

Nunca subas `.env.local` al repositorio — ya está en `.gitignore` justamente por esto. Y borra
de `Descargas` el JSON de credenciales que te dio Google cuando ya lo hayas usado: contiene el
secreto en texto plano.

> ✅ **Ya hecho.** Las credenciales del cliente `1389349130-…` están puestas tanto en local como
> en Vercel, y el botón de Google ya aparece en las dos.

---

## Paso 5 · Completar la información de la marca

Antes de publicar, Google exige cuatro datos. Si intentas pulsar **Publicar app** sin ellos, el
botón aparece deshabilitado con este aviso:

> *Se requieren un nombre de app, un correo electrónico de asistencia, una URL de página
> principal y una URL de política de privacidad válidos para cambiar la app al modo de
> producción externo.*

Ve a **Google Auth Platform → Información de la marca** (*Branding*) y completa:

| Campo | Qué poner |
|---|---|
| Nombre de la aplicación | `Jabones Mari` |
| Correo de asistencia | el correo del negocio |
| Logotipo | opcional — sirve `brand/logo/logo-mari.jpeg` |
| **Página principal** | `https://jabonesmari.shop` |
| **Política de privacidad** | `https://jabonesmari.shop/privacidad` |
| Condiciones del servicio | `https://jabonesmari.shop/terminos` |
| Dominios autorizados | `jabonesmari.shop` |

> ⚠️ **Google solo acepta esas URLs si el dominio ya responde y está verificado.** Por eso este
> paso va *después* de apuntar el DNS (ver `08-despliegue.md`, sección 7). Si el dominio todavía
> no resuelve, Google las rechaza por inválidas.

### Verificar el dominio ante Google

1. Entra a [Search Console](https://search.google.com/search-console) **con la misma cuenta de
   Google** con la que creaste el proyecto.
2. Agrega la propiedad `jabonesmari.shop` (tipo *Dominio*).
3. Añade en Hostinger el registro `TXT` que te dé, y pulsa verificar.

Una vez verificado, el dominio aparece disponible en *Dominios autorizados* de la pantalla de
consentimiento.

---

## Paso 6 · Publicar la aplicación

Mientras la app esté "En prueba", solo entran los correos que hayas agregado como usuarios de
prueba, con un tope de 100.

1. Vuelve a **Google Auth Platform → Público**.
2. Pulsa **Publicar app** y confirma.

Como solo pedimos el perfil básico y el correo (*scopes* no sensibles), **Google no exige
verificación** y la publicación es inmediata. Si algún día se piden permisos sensibles (leer Gmail,
Drive, etc.), ahí sí habría un proceso de revisión — pero esta tienda nunca los va a necesitar.

### Mientras tanto, puedes probar sin publicar

En **Público → Usuarios de prueba**, agrega tu propio correo y el de tu prima. Con eso el ingreso
con Google funciona para ustedes desde ya, aunque la app siga "En prueba".

---

## Cómo comprobar que quedó bien

1. Abre una ventana de incógnito en `http://localhost:3000/ingresar`.
2. Debe verse el botón **Continuar con Google** encima del formulario de correo.
3. Púlsalo, elige una cuenta y acepta.
4. Debe devolverte a `/mi-cuenta` con tu nombre y tu foto de Google arriba.

---

## Si algo sale mal

| Lo que ves | Qué pasó | Cómo se arregla |
|---|---|---|
| `redirect_uri_mismatch` | La URI de redireccionamiento no coincide | Revisa el Paso 3.5 carácter por carácter. Ojo con `http` vs `https` y con barras al final |
| `Acceso bloqueado: no completó el proceso de verificación` | La app sigue "En prueba" y ese correo no está en la lista | Haz el Paso 5, o agrega ese correo como usuario de prueba |
| El botón de Google no aparece | Faltan las variables o no se reinició el servidor | Revisa `web/.env.local` y reinicia con `npm run dev` |
| `invalid_client` | El ID o el secreto están mal copiados | Vuelve a copiarlos; cuidado con espacios al inicio o al final |
| Entra pero crea una cuenta duplicada | — | No debería: el proyecto tiene *account linking* activo, así que si ya existía una cuenta con ese mismo correo, Google se vincula a ella |

---

## Qué datos pedimos y cuáles no

Solo el **nombre**, el **correo** y la **foto de perfil**. Nada más: ni contactos, ni calendario,
ni archivos. La clienta ve exactamente eso en la pantalla de consentimiento, y es lo que justifica
que Google no exija verificación.
