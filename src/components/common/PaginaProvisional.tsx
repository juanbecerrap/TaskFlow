import { useEffect } from 'react'

interface PaginaProvisionalProps {
  titulo: string
  descripcion?: string
}

export function PaginaProvisional({
  titulo,
  descripcion = 'Esta pantalla se desarrollará en una fase posterior.',
}: PaginaProvisionalProps) {
  useEffect(() => {
    document.title = `${titulo} · TaskFlow`
  }, [titulo])

  return (
    <section>
      <h1 className="h3 mb-2">{titulo}</h1>
      <p className="text-body-secondary mb-0">{descripcion}</p>
    </section>
  )
}