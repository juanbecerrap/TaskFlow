import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PaginaIniciarSesion } from './PaginaIniciarSesion'
import { PaginaRecuperarContrasena } from './PaginaRecuperarContrasena'
import { PaginaRegistro } from './PaginaRegistro'

function renderizar(pagina: ReactElement) {
  render(<MemoryRouter>{pagina}</MemoryRouter>)
}

describe('PaginaIniciarSesion', () => {
  it('muestra errores si se envía vacío', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Escribe tu correo electrónico')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña')).toBeInTheDocument()
  })

  it('con datos válidos muestra el aviso temporal', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText(/Datos válidos/)).toBeInTheDocument()
  })
})

describe('PaginaRegistro', () => {
  it('rechaza una contraseña sin número', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    await usuario.type(screen.getByLabelText('Contraseña'), 'abcdefgh')
    await usuario.type(screen.getByLabelText('Confirmación de contraseña'), 'abcdefgh')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Incluye al menos un número')).toBeInTheDocument()
  })

  it('avisa cuando las contraseñas no coinciden', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    await usuario.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.type(screen.getByLabelText('Confirmación de contraseña'), 'Clave9999')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('mostrar u ocultar es independiente en cada campo de contraseña', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    const contrasena = screen.getByLabelText('Contraseña')
    const confirmacion = screen.getByLabelText('Confirmación de contraseña')

    await usuario.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    expect(contrasena).toHaveAttribute('type', 'text')
    expect(confirmacion).toHaveAttribute('type', 'password')
  })

  it('con datos válidos muestra el aviso temporal', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    await usuario.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.type(screen.getByLabelText('Confirmación de contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText(/Datos válidos/)).toBeInTheDocument()
  })
})

describe('PaginaRecuperarContrasena', () => {
  it('rechaza un correo inválido', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRecuperarContrasena />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo')
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText('Escribe un correo válido')).toBeInTheDocument()
  })

  it('con un correo válido muestra el aviso temporal', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRecuperarContrasena />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText(/Datos válidos/)).toBeInTheDocument()
  })
})