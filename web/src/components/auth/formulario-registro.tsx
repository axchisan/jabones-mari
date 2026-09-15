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
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  email: z.string().trim().email('Escribe un correo válido'),
  password: z
    .string()
    .min(8, 'Usa al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga'),
  telefono: z
    .string()
    .trim()
    .transform((valor) => valor.replace(/\D/g, ''))
    .refine((valor) => valor === '' || /^3\d{9}$/.test(valor), {
      message: 'Escribe un celular de 10 dígitos, por ejemplo 3211234567',
    })
    .optional(),
})

type Datos = z.infer<typeof esquema>

export function FormularioRegistro({
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

    const { error } = await clienteAuth.signUp.email({
      name: datos.name,
      email: datos.email,
      password: datos.password,
      telefono: datos.telefono || undefined,
    })

    if (error) {
      setErrorGeneral(
        error.code === 'USER_ALREADY_EXISTS'
          ? conGoogle
            ? 'Ya hay una cuenta con ese correo. Entra con tu contraseña, o con el botón de Google si así fue como te registraste.'
            : 'Ya hay una cuenta con ese correo. Entra con tu contraseña desde la página de ingreso.'
          : 'No pudimos crear la cuenta. Intenta de nuevo.',
      )
      return
    }

    // No entra directo: primero confirma el correo con el código.
    router.push(
      `/verificar?correo=${encodeURIComponent(datos.email)}&volver=${encodeURIComponent(volver)}`,
    )
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
        <Campo id="name" etiqueta="Tu nombre" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Laura Gómez"
            {...register('name')}
            className={claseEntrada(Boolean(errors.name))}
          />
        </Campo>

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

        <Campo
          id="password"
          etiqueta="Contraseña"
          ayuda="Mínimo 8 caracteres."
          error={errors.password?.message}
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
            className={claseEntrada(Boolean(errors.password))}
          />
        </Campo>

        <Campo
          id="telefono"
          etiqueta="Celular"
          ayuda="Opcional. Lo usamos para coordinar la entrega."
          error={errors.telefono?.message}
        >
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="321 288 1565"
            {...register('telefono')}
            className={`${claseEntrada(Boolean(errors.telefono))} cifra`}
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
          Crear mi cuenta
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-tinta-tenue">
        ¿Ya tienes cuenta?{' '}
        <Link href="/ingresar" className="font-semibold text-rosa-hondo hover:underline">
          Ingresa aquí
        </Link>
      </p>
    </>
  )
}
