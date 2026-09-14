import Image from 'next/image'
import Link from 'next/link'
import { NEGOCIO } from '@/lib/config'

export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${NEGOCIO.nombre}, inicio`}>
      <Image
        src="/logo-mari.png"
        alt=""
        width={44}
        height={44}
        priority
      />
      {!compacta && (
        <span className="leading-none">
          <span className="block font-[family-name:var(--font-display)] text-xl text-tinta">
            {NEGOCIO.nombreCorto}
          </span>
          <span className="versalita block text-[0.6rem] text-rosa-hondo">
            {NEGOCIO.tagline}
          </span>
        </span>
      )}
    </Link>
  )
}
