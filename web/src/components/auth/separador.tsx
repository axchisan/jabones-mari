export function Separador({ texto = 'o' }: { texto?: string }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-linea" />
      <span className="text-xs text-tinta-tenue">{texto}</span>
      <span className="h-px flex-1 bg-linea" />
    </div>
  )
}
