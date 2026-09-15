'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, MailCheck } from 'lucide-react'
import { clienteAuth } from '@/lib/auth/cliente'
import { cn } from '@/lib/utilidades'

const LARGO = 6
const ESPERA_REENVIO = 45

/**
 * Seis casillas para el código del correo.
 *
 * Pegar el código completo llena todas de una vez, que es lo que hace la
 * gente cuando lo copia del correo en el celular.
 */
export function FormularioCodigo({
  correo,
  volver,
}: {
  correo: string
  volver: string
}) {
  const router = useRouter()
  const [digitos, setDigitos] = useState<string[]>(Array(LARGO).fill(''))
  const [verificando, setVerificando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [espera, setEspera] = useState(ESPERA_REENVIO)

  const casillas = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    casillas.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (espera <= 0) return
    const id = setTimeout(() => setEspera((v) => v - 1), 1000)
    return () => clearTimeout(id)
  }, [espera])

  async function verificar(codigo: string) {
    setVerificando(true)
    setError(null)

    const { error: fallo } = await clienteAuth.emailOtp.verifyEmail({
      email: correo,
      otp: codigo,
    })

    if (fallo) {
      setError(
        fallo.code === 'INVALID_OTP' || fallo.status === 400
          ? 'Ese código no es correcto. Revísalo e intenta de nuevo.'
          : 'No pudimos verificar el código. Intenta de nuevo.',
      )
      setDigitos(Array(LARGO).fill(''))
      casillas.current[0]?.focus()
      setVerificando(false)
      return
    }

    router.push(volver)
    router.refresh()
  }

  function escribir(indice: number, valor: string) {
    const limpio = valor.replace(/\D/g, '')
    if (!limpio) return

    const siguientes = [...digitos]

    // Pegar el código completo llena todas las casillas de una vez.
    if (limpio.length > 1) {
      for (let i = 0; i < LARGO; i += 1) {
        siguientes[i] = limpio[i] ?? ''
      }
      setDigitos(siguientes)
      const completo = siguientes.join('')
      if (completo.length === LARGO) verificar(completo)
      return
    }

    siguientes[indice] = limpio
    setDigitos(siguientes)

    if (indice < LARGO - 1) {
      casillas.current[indice + 1]?.focus()
    }

    const completo = siguientes.join('')
    if (completo.length === LARGO && !siguientes.includes('')) {
      verificar(completo)
    }
  }

  function teclear(indice: number, evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Backspace') {
      evento.preventDefault()
      const siguientes = [...digitos]

      if (siguientes[indice]) {
        siguientes[indice] = ''
        setDigitos(siguientes)
      } else if (indice > 0) {
        siguientes[indice - 1] = ''
        setDigitos(siguientes)
        casillas.current[indice - 1]?.focus()
      }
    }

    if (evento.key === 'ArrowLeft' && indice > 0) casillas.current[indice - 1]?.focus()
    if (evento.key === 'ArrowRight' && indice < LARGO - 1) casillas.current[indice + 1]?.focus()
  }

  async function reenviar() {
    setReenviando(true)
    setError(null)
    setAviso(null)

    const { error: fallo } = await clienteAuth.emailOtp.sendVerificationOtp({
      email: correo,
      type: 'email-verification',
    })

    if (fallo) {
      setError('No pudimos reenviar el código. Intenta en un momento.')
    } else {
      setAviso('Te mandamos un código nuevo.')
      setEspera(ESPERA_REENVIO)
    }

    setReenviando(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-rosa-suave text-rosa-hondo">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <p className="text-tinta-media">
          Te mandamos un código de {LARGO} dígitos a
          <br />
          <strong className="text-tinta">{correo}</strong>
        </p>
      </div>

      <div className="flex justify-center gap-2" role="group" aria-label="Código de verificación">
        {digitos.map((digito, indice) => (
          <input
            key={indice}
            ref={(el) => {
              casillas.current[indice] = el
            }}
            id={`codigo-${indice}`}
            type="text"
            inputMode="numeric"
            autoComplete={indice === 0 ? 'one-time-code' : 'off'}
            maxLength={LARGO}
            value={digito}
            disabled={verificando}
            aria-label={`Dígito ${indice + 1} de ${LARGO}`}
            onChange={(evento) => escribir(indice, evento.target.value)}
            onKeyDown={(evento) => teclear(indice, evento)}
            className={cn(
              'cifra size-12 rounded-suave border-2 bg-white text-center text-xl font-semibold outline-none transition',
              error ? 'border-rosa-hondo' : 'border-linea-fuerte focus:border-rosa',
              verificando && 'opacity-60',
            )}
          />
        ))}
      </div>

      {verificando && (
        <p className="flex items-center justify-center gap-2 text-sm text-tinta-media">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Verificando…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {aviso && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-suave bg-salvia-suave px-4 py-3 text-sm text-salvia"
        >
          <Check className="size-4 shrink-0" aria-hidden="true" />
          {aviso}
        </p>
      )}

      <div className="text-center text-sm">
        {espera > 0 ? (
          <p className="text-tinta-tenue">
            ¿No te llegó? Puedes pedir otro en {espera} s
          </p>
        ) : (
          <button
            type="button"
            disabled={reenviando}
            onClick={reenviar}
            className="inline-flex items-center gap-1.5 font-semibold text-rosa-hondo hover:underline disabled:opacity-60"
          >
            {reenviando && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Enviarme otro código
          </button>
        )}
      </div>

      <p className="text-center text-xs text-tinta-tenue">
        Revisa también la carpeta de correo no deseado.
      </p>
    </div>
  )
}
