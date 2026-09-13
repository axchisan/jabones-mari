'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check } from 'lucide-react'
import { z } from 'zod'
import { clienteAuth } from '@/lib/auth/cliente'
import { Campo, claseEntrada } from '@/components/auth/campos'

const esquema = z.object({
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

type Datos = z.infer<typeof esquema>

export function FormularioDatosEntrega({ inicial }: { inicial: Datos }) {
  const router = useRouter()
  const [guardado, setGuardado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: inicial })

  async function alEnviar(datos: Datos) {
    setErrorGeneral(null)
    setGuardado(false)

    const { error } = await clienteAuth.updateUser({
      telefono: datos.telefono,
      direccion: datos.direccion,
      barrio: datos.barrio,
    })

    if (error) {
      setErrorGeneral('No pudimos guardar tus datos. Intenta de nuevo.')
      return
    }

    setGuardado(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate className="mt-4 flex flex-col gap-4">
      <Campo id="cuenta-telefono" etiqueta="Celular" error={errors.telefono?.message}>
        <input
          id="cuenta-telefono"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="321 288 1565"
          {...register('telefono')}
          className={`${claseEntrada(Boolean(errors.telefono))} cifra`}
        />
      </Campo>

      <Campo id="cuenta-direccion" etiqueta="Dirección" error={errors.direccion?.message}>
        <input
          id="cuenta-direccion"
          type="text"
          autoComplete="street-address"
          placeholder="Calle 134 #58-20, apto 302"
          {...register('direccion')}
          className={claseEntrada(Boolean(errors.direccion))}
        />
      </Campo>

      <Campo id="cuenta-barrio" etiqueta="Barrio o localidad" error={errors.barrio?.message}>
        <input
          id="cuenta-barrio"
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
          Guardar mis datos
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
