'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, UserPlus, ShieldCheck, User, Trash2 } from 'lucide-react'
import {
  crearAdmin,
  cambiarRol,
  eliminarUsuario,
  type Miembro,
} from '@/lib/admin/acciones-equipo'
import type { ResultadoAccion } from '@/lib/admin/acciones-productos'
import { fechaLegible } from '@/lib/formato'
import { cn } from '@/lib/utilidades'

export function GestionEquipo({
  miembros,
  miId,
}: {
  miembros: Miembro[]
  miId: string
}) {
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [aviso, setAviso] = useState<ResultadoAccion | null>(null)

  const admins = miembros.filter((m) => m.rol === 'admin')
  const clientas = miembros.filter((m) => m.rol !== 'admin')

  function ejecutar(accion: () => Promise<ResultadoAccion>) {
    iniciar(async () => {
      const resultado = await accion()
      setAviso(resultado)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {aviso && (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-suave px-4 py-3 text-sm',
            aviso.ok ? 'bg-salvia-suave text-salvia' : 'bg-rosa-suave text-rosa-hondo',
          )}
        >
          {aviso.ok ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          {aviso.ok ? aviso.mensaje : aviso.error}
        </p>
      )}

      <FormularioNuevoAdmin />

      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl">
          <ShieldCheck className="size-5 text-rosa" aria-hidden="true" />
          Con acceso al panel ({admins.length})
        </h2>

        <ul className="mt-4 divide-y divide-linea">
          {admins.map((miembro) => (
            <FilaMiembro
              key={miembro.id}
              miembro={miembro}
              soyYo={miembro.id === miId}
              pendiente={pendiente}
              alCambiarRol={(rol) => ejecutar(() => cambiarRol(miembro.id, rol))}
              alEliminar={() => ejecutar(() => eliminarUsuario(miembro.id))}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-tarjeta border border-linea bg-white p-5">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl">
          <User className="size-5 text-tinta-tenue" aria-hidden="true" />
          Clientas registradas ({clientas.length})
        </h2>
        <p className="mt-0.5 text-sm text-tinta-media">
          Solo ven sus propios pedidos. Puedes darles acceso al panel si hacen parte del equipo.
        </p>

        {clientas.length === 0 ? (
          <p className="mt-4 rounded-suave border border-dashed border-linea-fuerte bg-crema px-4 py-6 text-center text-sm text-tinta-media">
            Todavía nadie se ha registrado como clienta.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-linea">
            {clientas.map((miembro) => (
              <FilaMiembro
                key={miembro.id}
                miembro={miembro}
                soyYo={miembro.id === miId}
                pendiente={pendiente}
                alCambiarRol={(rol) => ejecutar(() => cambiarRol(miembro.id, rol))}
                alEliminar={() => ejecutar(() => eliminarUsuario(miembro.id))}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function FilaMiembro({
  miembro,
  soyYo,
  pendiente,
  alCambiarRol,
  alEliminar,
}: {
  miembro: Miembro
  soyYo: boolean
  pendiente: boolean
  alCambiarRol: (rol: 'admin' | 'cliente') => void
  alEliminar: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const esAdmin = miembro.rol === 'admin'

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {miembro.nombre}
          {soyYo && (
            <span className="rounded-full bg-rosa-suave px-2 py-0.5 text-[0.65rem] text-rosa-hondo">
              Eres tú
            </span>
          )}
        </p>
        <p className="truncate text-sm text-tinta-media">{miembro.correo}</p>
        <p className="text-xs text-tinta-tenue">
          Desde {fechaLegible(miembro.creadoEn)}
          {miembro.tienePedidos && ' · tiene pedidos'}
        </p>
      </div>

      {confirmando ? (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-tinta-media">¿Eliminar la cuenta?</span>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              alEliminar()
              setConfirmando(false)
            }}
            className="rounded-full bg-rosa-hondo px-3.5 py-1.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="text-tinta-media hover:underline"
          >
            No
          </button>
        </span>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={pendiente || soyYo}
            onClick={() => alCambiarRol(esAdmin ? 'cliente' : 'admin')}
            className="rounded-full border border-linea-fuerte bg-white px-4 py-2 text-sm transition enabled:hover:border-rosa enabled:hover:text-rosa-hondo disabled:opacity-40"
            title={
              soyYo
                ? 'No puedes cambiarte el rol a ti misma'
                : esAdmin
                  ? 'Quitar el acceso al panel'
                  : 'Dar acceso al panel'
            }
          >
            {esAdmin ? 'Quitar acceso' : 'Dar acceso al panel'}
          </button>

          {!soyYo && (
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmando(true)}
              className="grid size-9 place-items-center rounded-full text-tinta-tenue transition hover:bg-rosa-suave hover:text-rosa-hondo"
              aria-label={`Eliminar la cuenta de ${miembro.correo}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </li>
  )
}

function FormularioNuevoAdmin() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)

  const [estado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(
    async (previo, datos) => {
      const resultado = await crearAdmin(previo, datos)
      if (resultado.ok) {
        router.refresh()
        setAbierto(false)
      }
      return resultado
    },
    null,
  )

  if (!abierto) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tarjeta border border-linea bg-white p-5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Sumar a alguien al equipo
          </h2>
          <p className="mt-0.5 text-sm text-tinta-media">
            Podrá editar el catálogo y atender los pedidos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 font-semibold text-white transition hover:bg-rosa-hondo"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Agregar
        </button>
      </div>
    )
  }

  return (
    <form action={accion} className="rounded-tarjeta border-2 border-rosa bg-rosa-niebla p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl">Nueva administradora</h2>
      <p className="mt-0.5 text-sm text-tinta-media">
        Si esa persona ya tiene cuenta de clienta, se le da acceso y conserva su contraseña.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="equipo-name" className="text-xs font-semibold text-tinta-media">
            Nombre
          </label>
          <input
            id="equipo-name"
            name="name"
            type="text"
            required
            maxLength={80}
            placeholder="María José"
            className={entrada}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="equipo-email" className="text-xs font-semibold text-tinta-media">
            Correo
          </label>
          <input
            id="equipo-email"
            name="email"
            type="email"
            required
            placeholder="maria@ejemplo.com"
            className={entrada}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="equipo-password" className="text-xs font-semibold text-tinta-media">
            Contraseña temporal
          </label>
          <input
            id="equipo-password"
            name="password"
            type="text"
            required
            minLength={8}
            maxLength={128}
            placeholder="Mínimo 8 caracteres"
            className={entrada}
          />
          <p className="text-[0.7rem] text-tinta-tenue">
            Compártesela y que la cambie al entrar.
          </p>
        </div>
      </div>

      {estado && !estado.ok && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-suave bg-rosa-suave px-4 py-3 text-sm text-rosa-hondo"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {estado.error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-full bg-rosa px-6 py-2.5 font-semibold text-white transition hover:bg-rosa-hondo disabled:opacity-60"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Crear acceso
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full border border-linea-fuerte bg-white px-5 py-2.5 text-sm text-tinta-media transition hover:text-tinta"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

const entrada =
  'w-full rounded-suave border border-linea-fuerte bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-rosa'
