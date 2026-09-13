import { Encabezado } from '@/components/encabezado'
import { PieDePagina } from '@/components/pie-de-pagina'
import { CajonCarrito } from '@/components/cajon-carrito'
import { BotonWhatsappFlotante } from '@/components/boton-whatsapp'

/** Todo lo que ve la clienta: encabezado, carrito y contacto siempre a mano. */
export default function LayoutTienda({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-tinta focus:px-5 focus:py-2 focus:text-sm focus:text-crema"
      >
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <PieDePagina />
      <CajonCarrito />
      <BotonWhatsappFlotante />
    </>
  )
}
