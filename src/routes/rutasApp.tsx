import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../components/layout/AuthLayout'
import { PaginaNoEncontrada } from '../components/common/PaginaNoEncontrada'
import { PaginaProvisional } from '../components/common/PaginaProvisional'
import { RUTAS } from './rutas'

export const rutasApp: RouteObject[] = [
  {
    path: RUTAS.inicio,
    element: <Navigate to={RUTAS.panel} replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: RUTAS.iniciarSesion,
        element: <PaginaProvisional titulo="Iniciar sesión" />,
      },
      {
        path: RUTAS.registro,
        element: <PaginaProvisional titulo="Crear cuenta" />,
      },
      {
        path: RUTAS.recuperarContrasena,
        element: <PaginaProvisional titulo="Recuperar contraseña" />,
      },
    ],
  },
  {
    element: <AppShell />,
    children: [
      { path: RUTAS.panel, element: <PaginaProvisional titulo="Panel" /> },
      {
        path: RUTAS.proyectos,
        element: <PaginaProvisional titulo="Proyectos" />,
      },
      {
        path: RUTAS.proyectoPatron,
        element: <PaginaProvisional titulo="Detalle de proyecto" />,
      },
      { path: RUTAS.tareas, element: <PaginaProvisional titulo="Tareas" /> },
      { path: RUTAS.tablero, element: <PaginaProvisional titulo="Tablero" /> },
      { path: RUTAS.perfil, element: <PaginaProvisional titulo="Perfil" /> },
    ],
  },
  { path: '*', element: <PaginaNoEncontrada /> },
]