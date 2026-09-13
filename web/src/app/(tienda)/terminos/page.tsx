import type { Metadata } from 'next'
import Link from 'next/link'
import { NEGOCIO, DOMICILIO, enlaceWhatsApp } from '@/lib/config'
import { telefonoLegible } from '@/lib/formato'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Cómo funcionan los pedidos en Jabones Mari: confirmación por WhatsApp, entregas, cambios y garantías.',
  alternates: { canonical: '/terminos' },
}

const ACTUALIZADA = '13 de septiembre de 2026'

export default function Terminos() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="flex flex-col gap-2">
        <span className="versalita text-rosa-hondo">Legal</span>
        <h1 className="text-[clamp(2rem,5vw,2.8rem)] leading-tight">
          Términos y condiciones
        </h1>
        <p className="text-sm text-tinta-tenue">Última actualización: {ACTUALIZADA}</p>
      </header>

      <div className="mt-8 flex flex-col gap-6 text-[1.02rem] leading-relaxed text-tinta-media">
        <p className="rounded-tarjeta bg-rosa-niebla px-5 py-4 text-tinta">
          <strong>En corto:</strong> lo que armas aquí es una solicitud de pedido, no una
          compra cerrada. Nada queda en firme hasta que lo confirmamos contigo por WhatsApp,
          y ahí acordamos el pago y la entrega.
        </p>

        <Seccion titulo="Cómo funciona un pedido">
          <ol className="flex flex-col gap-1.5 pl-5">
            <li className="list-decimal marker:text-rosa">
              Eliges tus jabones y los agregas al carrito.
            </li>
            <li className="list-decimal marker:text-rosa">
              Dejas tu nombre, tu celular y, si quieres, tu dirección.
            </li>
            <li className="list-decimal marker:text-rosa">
              El pedido queda registrado con un código (por ejemplo, MARI-0042) y te
              llevamos a WhatsApp con el detalle ya escrito.
            </li>
            <li className="list-decimal marker:text-rosa">
              Confirmamos disponibilidad, el valor total y cómo y cuándo te lo entregamos.
            </li>
          </ol>
          <p className="mt-3">
            <strong>El pedido solo queda en firme en el paso 4.</strong> Mientras tanto
            puedes cambiarlo o cancelarlo sin ningún costo, simplemente diciéndonoslo por el
            chat.
          </p>
        </Seccion>

        <Seccion titulo="Precios y disponibilidad">
          <p>
            Los precios que ves están en pesos colombianos e incluyen el valor del producto.
            Como trabajamos por tandas pequeñas, puede pasar que algo se agote entre que haces
            el pedido y lo confirmamos: en ese caso te avisamos y te proponemos alternativas o
            esperamos a la siguiente tanda, como prefieras.
          </p>
          <p className="mt-3">
            Podemos ajustar precios cuando cambien los costos, pero{' '}
            <strong>un pedido ya confirmado mantiene el precio acordado</strong>.
          </p>
        </Seccion>

        <Seccion titulo="Pago">
          <p>
            No cobramos en línea y esta página nunca te pedirá datos de tarjeta. El medio de
            pago se acuerda por WhatsApp al confirmar.
          </p>
        </Seccion>

        <Seccion titulo="Entregas">
          <p>{DOMICILIO.texto}</p>
          <p className="mt-3">
            Las entregas son en {NEGOCIO.ciudad}. El tiempo depende de la zona y de si el
            producto está listo o sale de la siguiente tanda; te lo decimos al confirmar.
          </p>
        </Seccion>

        <Seccion titulo="Cambios y devoluciones">
          <p>
            Por tratarse de productos de cuidado personal, solo recibimos devoluciones de
            jabones <strong>sin usar y en su empaque original</strong>.
          </p>
          <p className="mt-3">
            Si tu jabón llega roto, incompleto o distinto a lo que pediste, escríbenos dentro
            de los <strong>5 días</strong> siguientes a la entrega con una foto y lo
            reponemos o te devolvemos el dinero, como prefieras.
          </p>
          <p className="mt-3">
            Conservas además el derecho de retracto y las garantías que te da el{' '}
            <strong>Estatuto del Consumidor</strong> (Ley 1480 de 2011).
          </p>
        </Seccion>

        <Seccion titulo="Sobre el producto">
          <p>
            Nuestros jabones son <strong>cosméticos artesanales</strong>, no medicamentos. Los
            beneficios que describimos son los del cuidado cosmético de la piel: limpiar,
            hidratar, exfoliar, calmar. No tratan, curan ni previenen enfermedades.
          </p>
          <p className="mt-3">
            Si tienes una condición en la piel, alergias o dudas, consulta a tu dermatóloga o
            dermatólogo. Ante ingredientes nuevos, prueba primero en una zona pequeña. Suspende
            el uso si aparece irritación.
          </p>
          <p className="mt-3">
            Al ser hechos a mano, el color, el aroma y la forma varían levemente entre tandas.
            Las fotos son representativas del producto real, pero cada jabón es único.
          </p>
        </Seccion>

        <Seccion titulo="Tu cuenta">
          <p>
            Si creas una cuenta, eres responsable de cuidar tu contraseña. Puedes pedirnos que
            la eliminemos cuando quieras. Podemos cerrar cuentas que se usen para hacer pedidos
            falsos o abusar del servicio.
          </p>
        </Seccion>

        <Seccion titulo="Contenido de la página">
          <p>
            Las fotos, los textos y la marca {NEGOCIO.nombreCorto} son nuestros. Puedes
            compartirlos citándonos, pero no usarlos para vender productos de otra persona.
          </p>
        </Seccion>

        <Seccion titulo="Cómo contactarnos">
          <p>
            Por WhatsApp al{' '}
            <a
              href={enlaceWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="cifra font-semibold text-rosa-hondo hover:underline"
            >
              {telefonoLegible(NEGOCIO.whatsapp)}
            </a>
            . Es nuestro canal principal y por donde respondemos más rápido.
          </p>
        </Seccion>
      </div>

      <p className="mt-10 text-center text-sm text-tinta-media">
        También puedes leer nuestra{' '}
        <Link href="/privacidad" className="font-semibold text-rosa-hondo hover:underline">
          política de privacidad
        </Link>
        .
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
