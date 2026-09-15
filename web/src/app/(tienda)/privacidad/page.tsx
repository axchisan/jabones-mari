import type { Metadata } from 'next'
import Link from 'next/link'
import { NEGOCIO, enlaceWhatsApp } from '@/lib/config'
import { telefonoLegible } from '@/lib/formato'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Qué datos personales recogemos en Jabones Mari, para qué los usamos y cómo puedes pedir que los borremos.',
  alternates: { canonical: '/privacidad' },
}

const ACTUALIZADA = '13 de septiembre de 2026'

export default function Privacidad() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="flex flex-col gap-2">
        <span className="versalita text-rosa-hondo">Legal</span>
        <h1 className="text-[clamp(2rem,5vw,2.8rem)] leading-tight">
          Política de privacidad
        </h1>
        <p className="text-sm text-tinta-tenue">Última actualización: {ACTUALIZADA}</p>
      </header>

      <div className="mt-8 flex flex-col gap-6 text-[1.02rem] leading-relaxed text-tinta-media">
        <p className="rounded-tarjeta bg-rosa-niebla px-5 py-4 text-tinta">
          <strong>En corto:</strong> solo pedimos lo necesario para llevarte el pedido —
          tu nombre, tu celular y tu dirección. No vendemos tus datos a nadie, no
          manejamos pagos en línea y puedes pedirnos que borremos todo cuando quieras
          escribiéndonos por WhatsApp.
        </p>

        <Seccion titulo="Quién responde por tus datos">
          <p>
            {NEGOCIO.nombre} ({NEGOCIO.tagline}), emprendimiento artesanal ubicado en{' '}
            {NEGOCIO.ciudad}, {NEGOCIO.pais}. Puedes contactarnos por WhatsApp al{' '}
            <a
              href={enlaceWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="cifra font-semibold text-rosa-hondo hover:underline"
            >
              {telefonoLegible(NEGOCIO.whatsapp)}
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="Qué datos recogemos">
          <p>Solo estos, y solo cuando tú los escribes:</p>
          <ul className="mt-2 flex flex-col gap-1.5 pl-5">
            <li className="list-disc marker:text-rosa">
              <strong>Al hacer un pedido:</strong> tu nombre, tu número de celular y, si nos
              los das, tu correo, tu dirección, tu barrio y las notas que nos escribas.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Si marcas la casilla de novedades:</strong> guardamos tu correo en una
              lista aparte, junto con la fecha en que lo aceptaste. Esa casilla nunca viene
              marcada: hay que marcarla a propósito.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Si creas una cuenta:</strong> tu correo y tu nombre. Si entras con
              Google, recibimos de Google tu nombre, tu correo y tu foto de perfil — nada
              más: ni tus contactos, ni tu calendario, ni tus archivos.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Tu contraseña</strong> se guarda cifrada. Ni nosotras podemos verla.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Estadísticas de visita</strong> anónimas y agregadas: qué páginas se
              ven más y desde dónde llega la gente. No identifican a nadie en particular.
            </li>
          </ul>
          <p className="mt-3">
            <strong>Nunca pedimos datos de pago.</strong> No tenemos pasarela: los pedidos se
            confirman y se pagan por fuera de esta página. Si alguna vez una página que dice
            ser nuestra te pide una tarjeta, no es nuestra.
          </p>
        </Seccion>

        <Seccion titulo="Para qué los usamos">
          <ul className="flex flex-col gap-1.5 pl-5">
            <li className="list-disc marker:text-rosa">
              Preparar tu pedido y coordinar contigo la entrega.
            </li>
            <li className="list-disc marker:text-rosa">
              Escribirte por WhatsApp para confirmar o resolver dudas de ese pedido.
            </li>
            <li className="list-disc marker:text-rosa">
              Mostrarte tu historial si tienes cuenta, y no volver a pedirte tus datos de
              entrega cada vez.
            </li>
            <li className="list-disc marker:text-rosa">
              Enviarte la confirmación de tu pedido, si nos diste tu correo.
            </li>
            <li className="list-disc marker:text-rosa">
              Contarte novedades <strong>solo si marcaste la casilla</strong>. Puedes darte
              de baja desde el enlace que va al pie de cada correo, y eso no afecta los
              correos de tus pedidos.
            </li>
            <li className="list-disc marker:text-rosa">
              Entender qué productos interesan más, con estadísticas anónimas.
            </li>
          </ul>
          <p className="mt-3">
            No te enviamos publicidad no solicitada ni añadimos tu número a listas de
            difusión sin que nos lo pidas.
          </p>
        </Seccion>

        <Seccion titulo="Con quién se comparten">
          <p>Con nadie más que los servicios que hacen funcionar la página:</p>
          <ul className="mt-2 flex flex-col gap-1.5 pl-5">
            <li className="list-disc marker:text-rosa">
              <strong>Vercel</strong> — aloja el sitio.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Neon</strong> — guarda la base de datos de productos y pedidos.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Cloudflare</strong> — guarda las fotos del catálogo.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Resend</strong> — envía los correos de confirmación y de novedades.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Google</strong> — solo si eliges entrar con tu cuenta de Google.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>WhatsApp (Meta)</strong> — cuando la conversación pasa al chat, se rige
              por las condiciones de WhatsApp.
            </li>
          </ul>
          <p className="mt-3">
            Ninguno de ellos recibe tus datos para usarlos por su cuenta.{' '}
            <strong>No vendemos ni alquilamos tu información.</strong>
          </p>
        </Seccion>

        <Seccion titulo="Cuánto tiempo los guardamos">
          <p>
            Los pedidos se conservan mientras sean útiles para atender garantías y llevar las
            cuentas del negocio. Si nos pides que borremos tu cuenta, la eliminamos y tus
            pedidos quedan sin quedar asociados a ti.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            La Ley 1581 de 2012 y el Decreto 1377 de 2013 te dan derecho a{' '}
            <strong>conocer, actualizar, rectificar y suprimir</strong> tus datos, y a
            revocar el permiso que nos diste para tratarlos.
          </p>
          <p className="mt-3">
            Para ejercerlos, escríbenos por WhatsApp al{' '}
            <a
              href={enlaceWhatsApp(
                'Hola, quiero hacer una solicitud sobre mis datos personales.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="cifra font-semibold text-rosa-hondo hover:underline"
            >
              {telefonoLegible(NEGOCIO.whatsapp)}
            </a>
            . Respondemos en un máximo de 15 días hábiles. Si tienes cuenta, también puedes
            cambiar tus datos tú misma desde{' '}
            <Link href="/mi-cuenta" className="font-semibold text-rosa-hondo hover:underline">
              Mi cuenta
            </Link>
            .
          </p>
          <p className="mt-3">
            Si consideras que no atendimos bien tu solicitud, puedes acudir a la{' '}
            <strong>Superintendencia de Industria y Comercio</strong>.
          </p>
        </Seccion>

        <Seccion titulo="Cookies y almacenamiento en tu navegador">
          <p>
            No usamos cookies de publicidad ni de seguimiento entre sitios. Solo guardamos
            en tu navegador lo mínimo para que la tienda funcione:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 pl-5">
            <li className="list-disc marker:text-rosa">
              <strong>Tu carrito</strong>, para que no se pierda si cierras la pestaña. Vive
              solo en tu dispositivo.
            </li>
            <li className="list-disc marker:text-rosa">
              <strong>Tu sesión</strong>, si creas cuenta, para no pedirte la contraseña cada
              vez.
            </li>
          </ul>
          <p className="mt-3">
            Puedes borrarlos vaciando los datos del sitio desde tu navegador.
          </p>
        </Seccion>

        <Seccion titulo="Menores de edad">
          <p>
            La tienda está dirigida a personas mayores de edad. Si eres menor, haz tus
            pedidos con el acompañamiento de tu madre, padre o acudiente.
          </p>
        </Seccion>

        <Seccion titulo="Cambios en esta política">
          <p>
            Si la actualizamos, cambiaremos la fecha del encabezado. Los cambios importantes
            los avisaremos en la página.
          </p>
        </Seccion>
      </div>

      <p className="mt-10 text-center text-sm text-tinta-media">
        ¿Alguna duda?{' '}
        <Link href="/contacto" className="font-semibold text-rosa-hondo hover:underline">
          Escríbenos
        </Link>
      </p>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xl text-tinta">{titulo}</h2>
      {children}
    </section>
  )
}
