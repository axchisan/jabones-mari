import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Gift, Users, PartyPopper } from 'lucide-react'
import { NEGOCIO, enlaceWhatsApp } from '@/lib/config'
import { precio } from '@/lib/formato'

export const metadata: Metadata = {
  title: 'Combos y detalles para regalo',
  description:
    'Sets de jabones artesanales para regalar: bolsa de organza, tarjeta y las recetas que elijas. Detalles para eventos en Bogotá.',
  alternates: { canonical: '/combos' },
}

const IDEAS = [
  {
    icono: Gift,
    titulo: 'Detalle para regalo',
    texto:
      'Dos o tres jabones pequeños en bolsa de organza, con cinta y tarjetita escrita a mano. El que más nos piden para cumpleaños.',
  },
  {
    icono: Users,
    titulo: 'Combo para la casa',
    texto:
      'Tres jabones grandes a elección, uno para cada uso: el fresco para la ducha, el suave para el rostro y el nutritivo para las manos.',
  },
  {
    icono: PartyPopper,
    titulo: 'Recordatorios de evento',
    texto:
      'Para matrimonios, bautizos y grados. Cotizamos por cantidad y personalizamos la tarjeta con tu mensaje.',
  },
]

export default function Combos() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="versalita text-rosa-hondo">Combos y regalos</span>
        <h1 className="text-[clamp(2.2rem,6vw,3.2rem)] leading-tight">
          Un jabón también es un buen detalle
        </h1>
        <p className="max-w-2xl text-tinta-media">
          Armamos los combos a la medida: tú eliges las recetas y los tamaños, y
          nosotras los preparamos y los empacamos. Escríbenos y te cotizamos
          según lo que necesites.
        </p>
      </header>

      <div className="mt-8 grid items-center gap-8 rounded-tarjeta border border-linea bg-white p-6 shadow-tarjeta md:grid-cols-2 md:p-8">
        <Image
          src="/productos/detalle-regalo.jpg"
          alt="Set de regalo con tres jabones pequeños de colores dentro de una bolsa de organza rosa con cinta de satén y tarjeta de papel kraft"
          width={900}
          height={900}
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="w-full rounded-suave object-cover"
        />
        <div className="flex flex-col items-start gap-4">
          <h2 className="text-3xl leading-tight">Set en bolsa de organza</h2>
          <p className="text-tinta-media">
            Elige las recetas que quieras, nosotras las empacamos en bolsa de
            organza con cinta de satén y una tarjeta en blanco para que escribas
            tu dedicatoria.
          </p>
          <p className="cifra text-tinta-media">
            Los jabones sueltos van desde {precio(5000)}. El valor del set depende
            de cuántos lleves y del empaque.
          </p>
          <a
            href={enlaceWhatsApp(
              `¡Hola ${NEGOCIO.nombreCorto}! Quiero cotizar un combo de jabones para regalo 🎁`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-whatsapp px-7 py-3.5 font-semibold text-white transition hover:brightness-110"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-[clamp(1.7rem,4vw,2.2rem)]">Ideas que funcionan</h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-3">
          {IDEAS.map(({ icono: Icono, titulo, texto }) => (
            <li
              key={titulo}
              className="flex flex-col gap-2.5 rounded-tarjeta border border-linea bg-white p-5"
            >
              <span className="grid size-11 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
                <Icono className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-[family-name:var(--font-sans)] text-[1rem] font-bold">
                {titulo}
              </h3>
              <p className="text-sm text-tinta-media">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-center text-tinta-media">
        ¿Prefieres armarlo tú?{' '}
        <Link href="/catalogo" className="font-semibold text-rosa-hondo hover:underline">
          Agrega los jabones que quieras al carrito
        </Link>{' '}
        y lo coordinamos por el chat.
      </p>
    </div>
  )
}
