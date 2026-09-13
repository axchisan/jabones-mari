import { GestionEquipo } from '@/components/admin/gestion-equipo'
import { listarUsuarios } from '@/lib/admin/acciones-equipo'
import { requerirAdmin } from '@/lib/auth/sesion'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Equipo' }

export default async function EquipoAdmin() {
  const [sesion, miembros] = await Promise.all([requerirAdmin(), listarUsuarios()])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)]">Equipo</h1>
        <p className="mt-1 text-tinta-media">
          Quién entra al panel y quién solo ve sus propios pedidos.
        </p>
      </header>

      <GestionEquipo miembros={miembros} miId={sesion.user.id} />
    </div>
  )
}
