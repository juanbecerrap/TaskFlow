import { useId, type ComponentPropsWithRef } from 'react'

interface CampoTextoProps extends Omit<ComponentPropsWithRef<'input'>, 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export function CampoTexto({
  etiqueta,
  error,
  ayuda,
  id,
  ...resto
}: CampoTextoProps) {
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
      <input
        {...resto}
        id={idCampo}
        className={`form-control${error ? ' is-invalid' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
      />
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