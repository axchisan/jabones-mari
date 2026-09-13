import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, MapPin, Clock } from 'lucide-react'
import { NEGOCIO, DOMICILIO, enlaceWhatsApp } from '@/lib/config'
import { telefonoLegible } from '@/lib/formato'

export const metadata: Metadata = {
  title: 'Contacto y pedidos',
  description:
    'Escríbenos por WhatsApp para hacer tu pedido, resolver dudas o coordinar entregas en Bogotá.',
  alternates: { canonical: '/contacto' },
}

export default function Contacto() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="versalita text-rosa-hondo">Contacto</span>
        <h1 className="text-[clamp(2.2rem,6vw,3.2rem)] leading-tight">
          Hablemos por WhatsApp
        </h1>
        <p className="max-w-xl text-tinta-media">
          Es nuestro canal principal. Ahí respondemos dudas, armamos combos a la
          medida y coordinamos entregas.
        </p>
      </header>

      <a
        href={enlaceWhatsApp(`¡Hola ${NEGOCIO.nombreCorto}! Quiero preguntarte por los jabones 🦋`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 flex items-center gap-4 rounded-tarjeta bg-whatsapp px-6 py-5 text-white shadow-tarjeta transition hover:brightness-110"
      >
        <MessageCircle className="size-7 shrink-0" aria-hidden="true" />
        <span>
          <span className="block font-semibold">Escríbenos ahora</span>
          <span className="cifra block text-sm opacity-90">
            {telefonoLegible(NEGOCIO.whatsapp)}
          </span>
        </span>
      </a>

      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-tarjeta border border-linea bg-white p-5">
          <dt className="flex items-center gap-2 font-semibold">
            <MapPin className="size-4 text-rosa" aria-hidden="true" />
            Dónde entregamos
          </dt>
          <dd className="mt-1.5 text-sm text-tinta-media">{DOMICILIO.texto}</dd>
        </div>
        <div className="rounded-tarjeta border border-linea bg-white p-5">
          <dt className="flex items-center gap-2 font-semibold">
            <Clock className="size-4 text-rosa" aria-hidden="true" />
            Tiempos
          </dt>
          <dd className="mt-1.5 text-sm text-tinta-media">
            Trabajamos por tandas. Si algún jabón está agotado, te contamos cuándo
            sale el siguiente.
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-2xl">Preguntas frecuentes</h2>
        <div className="mt-4 flex flex-col gap-2">
          {[
            {
              p: '¿Cómo pago?',
              r: 'Por ahora no cobramos en línea. Armas tu pedido en la página, te llevamos al chat y ahí acordamos el medio de pago y la entrega.',
            },
            {
              p: '¿Los jabones sirven para el rostro?',
              r: 'Depende de la receta. En cada ficha decimos si el uso es facial, corporal o ambos. Arroz, avena y cúrcuma y miel son los más usados para rostro.',
            },
            {
              p: '¿Hacen combos para eventos o detalles?',
              r: 'Sí. Armamos sets con bolsa de organza y tarjeta. Escríbenos con la cantidad y la fecha y te cotizamos.',
            },
            {
              p: '¿Tienen fragancia artificial?',
              r: 'No. El aroma viene del propio ingrediente: romero, menta, naranja, miel. El de arroz es prácticamente neutro.',
            },
          ].map(({ p, r }) => (
            <details
              key={p}
              className="group rounded-suave border border-linea bg-white px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {p}
                  <span
                    aria-hidden="true"
                    className="text-rosa transition group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2.5 text-[0.95rem] text-tinta-media">{r}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-9 text-center text-sm text-tinta-media">
        ¿Ya sabes qué quieres?{' '}
        <Link href="/catalogo" className="font-semibold text-rosa-hondo hover:underline">
          Arma tu pedido en el catálogo
        </Link>
      </p>
    </div>
  )
}
