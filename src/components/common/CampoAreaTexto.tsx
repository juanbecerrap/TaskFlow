import { useId, type ComponentPropsWithRef } from 'react'

interface CampoAreaTextoProps
  extends Omit<ComponentPropsWithRef<'textarea'>, 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export function CampoAreaTexto({
  etiqueta,
  error,
  ayuda,
  id,
  ...resto
}: CampoAreaTextoProps) {
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
      <textarea
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