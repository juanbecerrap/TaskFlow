import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalConfirmacion } from './ModalConfirmacion'

function crearModal(propiedades: Partial<Parameters<typeof ModalConfirmacion>[0]> = {}) {
  return (
    <ModalConfirmacion
      abierto
      titulo="Eliminar proyecto"
      mensaje="Esta acción no se puede deshacer."
      textoConfirmar="Eliminar"
      onConfirmar={() => {}}
      onCancelar={() => {}}
      {...propiedades}
    />
  )
}

describe('ModalConfirmacion', () => {
  it('no se muestra cuando está cerrado', () => {
    render(crearModal({ abierto: false }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('se muestra como diálogo con nombre y descripción accesibles', () => {
    render(crearModal())
    const dialogo = screen.getByRole('dialog', { name: 'Eliminar proyecto' })
    expect(dialogo).toHaveAccessibleDescription('Esta acción no se puede deshacer.')
  })

  it('enfoca Cancelar al abrir y devuelve el foco al cerrar', () => {
    const { rerender } = render(
      <>
        <button type="button">Abrir</button>
        {crearModal({ abierto: false })}
      </>,
    )
    const botonAbrir = screen.getByRole('button', { name: 'Abrir' })
    botonAbrir.focus()

    rerender(
      <>
        <button type="button">Abrir</button>
        {crearModal({ abierto: true })}
      </>,
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()

    rerender(
      <>
        <button type="button">Abrir</button>
        {crearModal({ abierto: false })}
      </>,
    )
    expect(botonAbrir).toHaveFocus()
  })

  it('llama a onConfirmar y onCancelar con sus botones', () => {
    const alConfirmar = vi.fn()
    const alCancelar = vi.fn()
    render(crearModal({ onConfirmar: alConfirmar, onCancelar: alCancelar }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(alConfirmar).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(alCancelar).toHaveBeenCalledTimes(1)
  })

  it('Escape y clic en el fondo cancelan', () => {
    const alCancelar = vi.fn()
    render(crearModal({ onCancelar: alCancelar }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(alCancelar).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(alCancelar).toHaveBeenCalledTimes(2)
  })

  it('mientras carga, desactiva los botones e ignora Escape', () => {
    const alCancelar = vi.fn()
    render(crearModal({ cargando: true, onCancelar: alCancelar }))

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(alCancelar).not.toHaveBeenCalled()
  })
})