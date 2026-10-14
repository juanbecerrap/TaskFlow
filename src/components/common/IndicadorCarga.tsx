import './common.css'

interface IndicadorCargaProps {
  texto?: string
}

export function IndicadorCarga({ texto = 'Cargando…' }: IndicadorCargaProps) {
  return (
    <div role="status" className="d-flex align-items-center justify-content-center gap-2 py-4">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}