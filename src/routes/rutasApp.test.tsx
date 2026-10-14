import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { RUTAS } from './rutas'
import { rutasApp } from './rutasApp'

function renderizarEn(ruta: string) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(<RouterProvider router={router} />)
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
    renderizarEn(RUTAS.iniciarSesion)

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
})