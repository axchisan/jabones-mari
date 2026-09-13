import Link from 'next/link'

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="versalita text-rosa-hondo">Error 404</span>
      <h1 className="text-4xl">No encontramos esta página</h1>
      <p className="text-tinta-media">
        Puede que el enlace esté viejo o que hayamos movido algo de sitio.
      </p>
      <Link
        href="/catalogo"
        className="mt-2 rounded-full bg-rosa px-7 py-3 font-semibold text-white transition hover:bg-rosa-hondo"
      >
        Ver el catálogo
      </Link>
    </div>
  )
}
