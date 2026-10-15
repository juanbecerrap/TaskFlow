import type { ReactElement } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { PaginaIniciarSesion } from './PaginaIniciarSesion'
import { PaginaRecuperarContrasena } from './PaginaRecuperarContrasena'
import { PaginaRegistro } from './PaginaRegistro'

const servicio = vi.hoisted(() => ({
  iniciarSesion: vi.fn(),
  registrarUsuario: vi.fn(),
  enviarCorreoRecuperacion: vi.fn(),
  cerrarSesion: vi.fn(),
}))

vi.mock('../../features/auth/servicioAuth', () => servicio)

function renderizar(pagina: ReactElement) {
  render(<MemoryRouter>{pagina}</MemoryRouter>)
}

describe('PaginaIniciarSesion', () => {
  it('muestra errores si se envía vacío y no llama al servicio', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Escribe tu correo electrónico')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña')).toBeInTheDocument()
    expect(servicio.iniciarSesion).not.toHaveBeenCalled()
  })

  it('envía los datos válidos al servicio', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await screen.findByRole('button', { name: 'Iniciar sesión' })
    expect(servicio.iniciarSesion).toHaveBeenCalledWith({
      correo: 'ana@correo.com',
      contrasena: 'Clave1234',
    })
  })

  it('muestra el mensaje en español si el acceso falla', async () => {
    servicio.iniciarSesion.mockRejectedValueOnce(
      new FirebaseError('auth/invalid-credential', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos.',
    )
  })

  it('desactiva el botón mientras se envía', async () => {
    let terminar!: () => void
    servicio.iniciarSesion.mockReturnValueOnce(
      new Promise<void>((resolver) => {
        terminar = resolver
      }),
    )
    const usuario = userEvent.setup()
    renderizar(<PaginaIniciarSesion />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByRole('button', { name: 'Iniciando sesión…' }),
    ).toBeDisabled()

    await act(async () => {
      terminar()
    })
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
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
    expect(servicio.registrarUsuario).not.toHaveBeenCalled()
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
    expect(servicio.registrarUsuario).not.toHaveBeenCalled()
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

  it('envía los datos válidos al servicio', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    await usuario.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.type(screen.getByLabelText('Confirmación de contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await screen.findByRole('button', { name: 'Crear cuenta' })
    expect(servicio.registrarUsuario).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      correo: 'ana@correo.com',
      contrasena: 'Clave1234',
      confirmacion: 'Clave1234',
    })
  })

  it('muestra un mensaje si el correo ya está registrado', async () => {
    servicio.registrarUsuario.mockRejectedValueOnce(
      new FirebaseError('auth/email-already-in-use', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar(<PaginaRegistro />)

    await usuario.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave1234')
    await usuario.type(screen.getByLabelText('Confirmación de contraseña'), 'Clave1234')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese correo.',
    )
  })
})

describe('PaginaRecuperarContrasena', () => {
  it('rechaza un correo inválido', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRecuperarContrasena />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo')
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText('Escribe un correo válido')).toBeInTheDocument()
    expect(servicio.enviarCorreoRecuperacion).not.toHaveBeenCalled()
  })

  it('envía el correo y muestra siempre el mismo mensaje', async () => {
    const usuario = userEvent.setup()
    renderizar(<PaginaRecuperarContrasena />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText(/Si existe una cuenta con ese correo/)).toBeInTheDocument()
    expect(servicio.enviarCorreoRecuperacion).toHaveBeenCalledWith({
      correo: 'ana@correo.com',
    })
  })

  it('muestra un error si no hay conexión', async () => {
    servicio.enviarCorreoRecuperacion.mockRejectedValueOnce(
      new FirebaseError('auth/network-request-failed', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar(<PaginaRecuperarContrasena />)

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay conexión con el servidor. Revisa tu internet.',
    )
  })
})