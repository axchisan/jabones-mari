'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check, AlertCircle, KeyRound } from 'lucide-react'
import { z } from 'zod'
import { clienteAuth } from '@/lib/auth/cliente'
import { Campo, claseEntrada } from '@/components/auth/campos'
import { cn } from '@/lib/utilidades'

/* ------------------------------------------------------- datos personales */

const esquemaDatos = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  telefono: z
    .string()
    .trim()
    .transform((valor) => valor.replace(/\D/g, ''))
    .refine((valor) => valor === '' || /^3\d{9}$/.test(valor), {
      message: 'Escribe un celular de 10 dígitos, por ejemplo 3211234567',
    }),
  direccion: z.string().trim().max(160, 'La dirección es muy larga'),
  barrio: z.string().trim().max(80),
})

type Datos = z.infer<typeof esquemaDatos>

export function FormularioPerfil({ inicial }: { inicial: Datos }) {
  const router = useRouter()
  const [guardado, setGuardado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Datos>({ resolver: zodResolver(esquemaDatos), defaultValues: inicial })

  async function alEnviar(datos: Datos) {
    setErrorGeneral(null)
    setGuardado(false)

    const { error } = await clienteAuth.updateUser({
      name: datos.name,
      telefono: datos.telefono,
      direccion: datos.direccion,
      barrio: datos.barrio,
    })

    if (error) {
      setErrorGeneral('No pudimos guardar tus datos. Intenta de nuevo.')
      return
    }

    setGuardado(true)
    // Sin esto el formulario sigue creyendo que hay cambios sin guardar.
    reset(datos)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate className="mt-4 flex flex-col gap-4">
      <Campo id="perfil-nombre" etiqueta="Tu nombre" error={errors.name?.message}>
        <input
          id="perfil-nombre"
          type="text"
          autoComplete="name"
          {...register('name')}
          className={claseEntrada(Boolean(errors.name))}
        />
      </Campo>

      <Campo
        id="perfil-telefono"
        etiqueta="Celular"
        ayuda="Lo usamos para coordinar la entrega."
        error={errors.telefono?.message}
      >
        <input
          id="perfil-telefono"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="321 288 1565"
          {...register('telefono')}
          className={`${claseEntrada(Boolean(errors.telefono))} cifra`}
        />
      </Campo>

      <Campo id="perfil-direccion" etiqueta="Dirección" error={errors.direccion?.message}>
        <input
          id="perfil-direccion"
          type="text"
          autoComplete="street-address"
          placeholder="Calle 134 #58-20, apto 302"
          {...register('direccion')}
          className={claseEntrada(Boolean(errors.direccion))}
        />
      </Campo>

      <Campo id="perfil-barrio" etiqueta="Barrio o localidad" error={errors.barrio?.message}>
        <input
          id="perfil-barrio"
          type="text"
          placeholder="Cedritos, Usaquén"
          {...register('barrio')}
          className={claseEntrada(Boolean(errors.barrio))}
        />
      </Campo>

      {errorGeneral && (
        <p role="alert" className="rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo">
          {errorGeneral}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-6 py-3 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Guardar cambios
        </button>

        {guardado && !isDirty && (
          <span className="inline-flex items-center gap-1.5 text-sm text-salvia" role="status">
            <Check className="size-4" aria-hidden="true" />
            Guardado
          </span>
        )}
      </div>
    </form>
  )
}

/* ------------------------------------------------------------ contraseña */

const esquemaClave = z
  .object({
    actual: z.string().min(1, 'Escribe tu contraseña actual'),
    nueva: z.string().min(8, 'La nueva necesita al menos 8 caracteres').max(128),
    repetir: z.string().min(1, 'Repite la contraseña nueva'),
  })
  .refine((datos) => datos.nueva === datos.repetir, {
    message: 'Las dos contraseñas no coinciden',
    path: ['repetir'],
  })

type Clave = z.infer<typeof esquemaClave>

export function FormularioContrasena({ tieneContrasena }: { tieneContrasena: boolean }) {
  const [listo, setListo] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Clave>({ resolver: zodResolver(esquemaClave) })

  async function alEnviar(datos: Clave) {
    setErrorGeneral(null)
    setListo(false)

    const { error } = await clienteAuth.changePassword({
      currentPassword: datos.actual,
      newPassword: datos.nueva,
      // Cierra las sesiones de otros dispositivos: si alguien más entró, queda fuera.
      revokeOtherSessions: true,
    })

    if (error) {
      setErrorGeneral(
        error.status === 400 || error.status === 401
          ? 'La contraseña actual no es correcta.'
          : 'No pudimos cambiar la contraseña. Intenta de nuevo.',
      )
      return
    }

    setListo(true)
    reset()
  }

  if (!tieneContrasena) {
    return (
      <p className="mt-4 rounded-suave border border-linea bg-crema px-4 py-3 text-sm text-tinta-media">
        Entras con Google, así que no tienes contraseña que cambiar. Si quieres una, escríbenos
        y te ayudamos a configurarla.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate className="mt-4 flex flex-col gap-4">
      <Campo id="clave-actual" etiqueta="Contraseña actual" error={errors.actual?.message}>
        <input
          id="clave-actual"
          type="password"
          autoComplete="current-password"
          {...register('actual')}
          className={claseEntrada(Boolean(errors.actual))}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="clave-nueva"
          etiqueta="Contraseña nueva"
          ayuda="Mínimo 8 caracteres."
          error={errors.nueva?.message}
        >
          <input
            id="clave-nueva"
            type="password"
            autoComplete="new-password"
            {...register('nueva')}
            className={claseEntrada(Boolean(errors.nueva))}
          />
        </Campo>

        <Campo id="clave-repetir" etiqueta="Repítela" error={errors.repetir?.message}>
          <input
            id="clave-repetir"
            type="password"
            autoComplete="new-password"
            {...register('repetir')}
            className={claseEntrada(Boolean(errors.repetir))}
          />
        </Campo>
      </div>

      {errorGeneral && (
        <p role="alert" className="rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo">
          {errorGeneral}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-linea-fuerte bg-white px-6 py-3 font-semibold transition',
            'hover:border-rosa hover:text-rosa-hondo disabled:opacity-50',
          )}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="size-4" aria-hidden="true" />
          )}
          Cambiar contraseña
        </button>

        {listo && (
          <span className="inline-flex items-center gap-1.5 text-sm text-salvia" role="status">
            <Check className="size-4" aria-hidden="true" />
            Contraseña cambiada
          </span>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs text-tinta-tenue">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Al cambiarla se cierran las sesiones abiertas en otros dispositivos.
      </p>
    </form>
  )
}
