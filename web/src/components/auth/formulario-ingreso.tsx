'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { clienteAuth } from '@/lib/auth/cliente'
import { Campo, claseEntrada } from '@/components/auth/campos'
import { BotonGoogle } from '@/components/auth/boton-google'
import { Separador } from '@/components/auth/separador'

const esquema = z.object({
  email: z.string().trim().email('Escribe un correo válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type Datos = z.infer<typeof esquema>

export function FormularioIngreso({
  volver,
  conGoogle,
}: {
  volver: string
  conGoogle: boolean
}) {
  const router = useRouter()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Datos>({ resolver: zodResolver(esquema) })

  async function alEnviar(datos: Datos) {
    setErrorGeneral(null)

    const { error } = await clienteAuth.signIn.email({
      email: datos.email,
      password: datos.password,
    })

    if (error) {
      setErrorGeneral(
        error.status === 401 || error.status === 403
          ? conGoogle
            ? 'Ese correo o esa contraseña no coinciden. Si creaste la cuenta con Google, entra con el botón de arriba.'
            : 'Ese correo o esa contraseña no coinciden.'
          : 'No pudimos ingresar. Intenta de nuevo en un momento.',
      )
      return
    }

    router.push(volver)
    router.refresh()
  }

  return (
    <>
      {conGoogle && (
        <>
          <BotonGoogle volver={volver} />
          <Separador texto="o con tu correo" />
        </>
      )}

      <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-4">
        <Campo id="email" etiqueta="Correo" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            {...register('email')}
            className={claseEntrada(Boolean(errors.email))}
          />
        </Campo>

        <Campo id="password" etiqueta="Contraseña" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={claseEntrada(Boolean(errors.password))}
          />
        </Campo>

        {errorGeneral && (
          <p role="alert" className="rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo">
            {errorGeneral}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-full bg-rosa px-6 py-3.5 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          Ingresar
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-tinta-tenue">
        ¿No tienes cuenta?{' '}
        <Link href="/crear-cuenta" className="font-semibold text-rosa-hondo hover:underline">
          Créala aquí
        </Link>
      </p>
    </>
  )
}
