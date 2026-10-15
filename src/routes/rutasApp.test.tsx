import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from 'firebase/auth'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import { ContextoAuth, type EstadoAuth } from '../features/auth/contextoAuth'
import { RUTAS } from './rutas'
import { rutasApp } from './rutasApp'

const servicio = vi.hoisted(() => ({
  iniciarSesion: vi.fn(),
  registrarUsuario: vi.fn(),
  enviarCorreoRecuperacion: vi.fn(),
  cerrarSesion: vi.fn(),
}))

vi.mock('../features/auth/servicioAuth', () => servicio)
vi.mock('../features/proyectos/servicioProyectos', () => ({
  suscribirProyectos: vi.fn(() => vi.fn()),
  suscribirProyecto: vi.fn(() => vi.fn()),
  crearProyecto: vi.fn(),
  actualizarProyecto: vi.fn(),
  cambiarEstadoProyecto: vi.fn(),
  eliminarProyecto: vi.fn(),
  aProyecto: vi.fn(),
}))

const USUARIO = {
  uid: 'u1',
  email: 'ana@correo.com',
  displayName: 'Ana',
} as unknown as User

const CON_SESION: EstadoAuth = { usuario: USUARIO, cargando: false }
const SIN_SESION: EstadoAuth = { usuario: null, cargando: false }
const COMPROBANDO: EstadoAuth = { usuario: null, cargando: true }

function renderizarEn(ruta: string, estado: EstadoAuth = CON_SESION) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ContextoAuth.Provider value={estado}>
      <RouterProvider router={router} />
    </ContextoAuth.Provider>,
  )
}

describe('rutas de la aplicación', () => {
  it('redirige la raíz al panel', async () => {
    renderizarEn(RUTAS.inicio)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Panel' }),
    ).toBeInTheDocument()
  })

  it('muestra la página 404 en una ruta inexistente', async () => {
    renderizarEn('/ruta-que-no-existe')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Página no encontrada',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al panel' })).toBeInTheDocument()
  })

  it('las páginas de autenticación no muestran la barra lateral', async () => {
    renderizarEn(RUTAS.iniciarSesion, SIN_SESION)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Navegación principal' }),
    ).not.toBeInTheDocument()
  })

  it('navega desde la barra lateral', async () => {
    const usuario = userEvent.setup()
    renderizarEn(RUTAS.panel)

    await usuario.click(await screen.findByRole('link', { name: 'Proyectos' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Proyectos' }),
    ).toBeInTheDocument()
  })

  it('marca como activo "Proyectos" en el detalle de un proyecto', async () => {
    renderizarEn(RUTAS.proyecto('abc'))

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Detalle de proyecto',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('el menú móvil se abre con el botón y se cierra con Escape', async () => {
    const usuario = userEvent.setup()
    renderizarEn(RUTAS.panel)

    const boton = await screen.findByRole('button', {
      name: 'Menú de navegación',
    })
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')

    await usuario.keyboard('{Escape}')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('sin sesión, una ruta privada lleva a iniciar sesión', async () => {
    renderizarEn(RUTAS.proyectos, SIN_SESION)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Proyectos' }),
    ).not.toBeInTheDocument()
  })

  it('con sesión, las páginas de acceso llevan al panel', async () => {
    renderizarEn(RUTAS.registro, CON_SESION)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Panel' }),
    ).toBeInTheDocument()
  })

  it('mientras se comprueba la sesión no muestra contenido privado', async () => {
    renderizarEn(RUTAS.panel, COMPROBANDO)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Comprobando sesión…',
    )
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('muestra el correo de la cuenta y permite cerrar sesión', async () => {
    const usuario = userEvent.setup()
    renderizarEn(RUTAS.panel)

    expect(await screen.findByText('ana@correo.com')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(servicio.cerrarSesion).toHaveBeenCalledTimes(1)
  })
})