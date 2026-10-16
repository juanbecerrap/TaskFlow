import type { PrioridadTarea } from '../../types/modelos'
import { ETIQUETA_PRIORIDAD } from './etiquetas'

const CLASES: Record<PrioridadTarea, string> = {
  baja: 'text-bg-light border',
  media: 'text-bg-info',
  alta: 'text-bg-warning',
}

export function InsigniaPrioridad({ prioridad }: { prioridad: PrioridadTarea }) {
  return (
    <span className={`badge ${CLASES[prioridad]}`}>
      Prioridad {ETIQUETA_PRIORIDAD[prioridad].toLowerCase()}
    </span>
  )
}