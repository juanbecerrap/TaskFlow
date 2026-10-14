import { CircleAlert } from 'lucide-react'
import './common.css'

interface MensajeErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function MensajeError({ mensaje, onReintentar }: MensajeErrorProps) {
  return (
    <div role="alert" className="alert alert-danger d-flex align-items-start gap-2">
      <CircleAlert aria-hidden="true" size={20} className="flex-shrink-0 mt-1" />
      <div className="flex-grow-1">
        <p className="mb-0">{mensaje}</p>
        {onReintentar && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={onReintentar}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}