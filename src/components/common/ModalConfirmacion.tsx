import { useEffect, useId, useRef, type MouseEvent } from 'react'
import './common.css'

interface ModalConfirmacionProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  peligro?: boolean
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligro = true,
  cargando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  const idTitulo = useId()
  const idMensaje = useId()
  const dialogoRef = useRef<HTMLDivElement>(null)
  const botonCancelarRef = useRef<HTMLButtonElement>(null)

  // Siempre se usan las últimas funciones sin reiniciar el efecto principal.
  const alCancelarRef = useRef(onCancelar)
  const cargandoRef = useRef(cargando)
  useEffect(() => {
    alCancelarRef.current = onCancelar
    cargandoRef.current = cargando
  })

  useEffect(() => {
    if (!abierto) return

    const elementoPrevio =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    botonCancelarRef.current?.focus()

    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        if (!cargandoRef.current) alCancelarRef.current()
        return
      }
      if (evento.key !== 'Tab') return

      const botones = dialogoRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not([disabled])',
      )
      if (!botones || botones.length === 0) {
        evento.preventDefault()
        return
      }
      const primero = botones[0]
      const ultimo = botones[botones.length - 1]
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alPulsarTecla)
    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
      elementoPrevio?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  function alPulsarFondo(evento: MouseEvent<HTMLDivElement>) {
    if (evento.target === evento.currentTarget && !cargando) onCancelar()
  }

  return (
    <div className="tf-modal-backdrop" onClick={alPulsarFondo}>
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idMensaje}
        className="tf-modal"
      >
        <h2 id={idTitulo} className="tf-modal__title">
          {titulo}
        </h2>
        <p id={idMensaje} className="tf-modal__message">
          {mensaje}
        </p>
        <div className="tf-modal__actions">
          <button
            ref={botonCancelarRef}
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${peligro ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}