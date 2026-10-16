import { useId, type ComponentPropsWithRef } from 'react'

interface CampoSelectProps
  extends Omit<ComponentPropsWithRef<'select'>, 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export function CampoSelect({
  etiqueta,
  error,
  ayuda,
  id,
  children,
  ...resto
}: CampoSelectProps) {
  const idAutomatico = useId()
  const idCampo = id ?? idAutomatico
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`

  const descritoPor =
    [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="mb-3">
      <label htmlFor={idCampo} className="form-label">
        {etiqueta}
      </label>
      <select
        {...resto}
        id={idCampo}
        className={`form-select${error ? ' is-invalid' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
      >
        {children}
      </select>
      {ayuda && (
        <div id={idAyuda} className="form-text">
          {ayuda}
        </div>
      )}
      {error && (
        <div id={idError} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  )
}