import { cn } from '@/lib/utilidades'

export function claseEntrada(hayError?: boolean) {
  return cn(
    'w-full rounded-suave border bg-white px-4 py-3 text-[1rem] outline-none transition placeholder:text-tinta-tenue/70',
    hayError ? 'border-rosa-hondo' : 'border-linea-fuerte focus:border-rosa',
  )
}

export function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  children,
}: {
  id: string
  etiqueta: string
  ayuda?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-rosa-hondo">
          {error}
        </p>
      ) : ayuda ? (
        <p className="text-xs text-tinta-tenue">{ayuda}</p>
      ) : null}
    </div>
  )
}

export function CajaAuth({
  titulo,
  bajada,
  children,
  pie,
}: {
  titulo: string
  bajada: string
  children: React.ReactNode
  pie: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-[clamp(2rem,5vw,2.6rem)] leading-tight">{titulo}</h1>
        <p className="text-tinta-media">{bajada}</p>
      </header>

      <div className="mt-7 rounded-tarjeta border border-linea bg-white p-6 shadow-tarjeta">
        {children}
      </div>

      <p className="mt-5 text-center text-sm text-tinta-media">{pie}</p>
    </div>
  )
}
