import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import './common.css'

interface EstadoVacioProps {
  icono: LucideIcon
  titulo: string
  descripcion?: string
  children?: ReactNode
}

export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  children,
}: EstadoVacioProps) {
  return (
    <div className="tf-empty">
      <span className="tf-empty__icon" aria-hidden="true">
        <Icono size={28} />
      </span>
      <h2 className="tf-empty__title">{titulo}</h2>
      {descripcion && <p className="tf-empty__text">{descripcion}</p>}
      {children}
    </div>
  )
}