import { useId, useState, type ComponentPropsWithRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './common.css'

interface CampoContrasenaProps
  extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export function CampoContrasena({
  etiqueta,
  error,
  ayuda,
  id,
  ...resto
}: CampoContrasenaProps) {
  const [visible, setVisible] = useState(false)
  const idAutomatico = useId()
  const idCampo = id ?? idAutomatico
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`

  const descritoPor =
    [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') ||
    undefined

  const accion = visible ? 'Ocultar' : 'Mostrar'
  const Icono = visible ? EyeOff : Eye

  return (
    <div className="mb-3">
      <label htmlFor={idCampo} className="form-label">
        {etiqueta}
      </label>
      <div className="tf-password">
        <input
          {...resto}
          id={idCampo}
          type={visible ? 'text' : 'password'}
          className={`form-control${error ? ' is-invalid' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritoPor}
        />
        <button
          type="button"
          className="tf-password__toggle"
          onClick={() => setVisible((actual) => !actual)}
          aria-label={`${accion} ${etiqueta.toLowerCase()}`}
        >
          <Icono aria-hidden="true" size={20} />
        </button>
      </div>
      {ayuda && (
        <div id={idAyuda} className="form-text">
          {ayuda}
        </div>
      )}
      {error && (
        <div id={idError} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  )
}