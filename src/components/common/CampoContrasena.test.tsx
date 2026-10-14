import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CampoContrasena } from './CampoContrasena'

describe('CampoContrasena', () => {
  it('empieza oculto y cambia entre mostrar y ocultar', () => {
    render(<CampoContrasena etiqueta="Contraseña" />)
    const campo = screen.getByLabelText('Contraseña')
    expect(campo).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(campo).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(campo).toHaveAttribute('type', 'password')
  })

  it('cada campo tiene su propio estado', () => {
    render(
      <>
        <CampoContrasena etiqueta="Contraseña" />
        <CampoContrasena etiqueta="Confirmación de contraseña" />
      </>,
    )
    const primero = screen.getByLabelText('Contraseña')
    const segundo = screen.getByLabelText('Confirmación de contraseña')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    expect(primero).toHaveAttribute('type', 'text')
    expect(segundo).toHaveAttribute('type', 'password')
  })

  it('el botón no envía formularios', () => {
    render(<CampoContrasena etiqueta="Contraseña" />)
    expect(
      screen.getByRole('button', { name: 'Mostrar contraseña' }),
    ).toHaveAttribute('type', 'button')
  })

  it('asocia el error al campo de forma accesible', () => {
    render(<CampoContrasena etiqueta="Contraseña" error="Es obligatoria" />)
    const campo = screen.getByLabelText('Contraseña')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription('Es obligatoria')
  })
})