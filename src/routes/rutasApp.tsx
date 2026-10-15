import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../components/layout/AuthLayout'
import { PaginaNoEncontrada } from '../components/common/PaginaNoEncontrada'
import { PaginaIniciarSesion } from '../pages/auth/PaginaIniciarSesion'
import { PaginaRecuperarContrasena } from '../pages/auth/PaginaRecuperarContrasena'
import { PaginaRegistro } from '../pages/auth/PaginaRegistro'
import { PaginaDetalleProyecto } from '../pages/PaginaDetalleProyecto'
import { PaginaPanel } from '../pages/PaginaPanel'
import { PaginaPerfil } from '../pages/PaginaPerfil'
import { PaginaProyectos } from '../pages/PaginaProyectos'
import { PaginaTablero } from '../pages/PaginaTablero'
import { PaginaTareas } from '../pages/PaginaTareas'
import { RUTAS } from './rutas'
import { RutaProtegida } from './RutaProtegida'
import { RutaSoloPublica } from './RutaSoloPublica'

export const rutasApp: RouteObject[] = [
  {
    path: RUTAS.inicio,
    element: <Navigate to={RUTAS.panel} replace />,
  },
  {
    element: <RutaSoloPublica />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: RUTAS.iniciarSesion, element: <PaginaIniciarSesion /> },
          { path: RUTAS.registro, element: <PaginaRegistro /> },
          {
            path: RUTAS.recuperarContrasena,
            element: <PaginaRecuperarContrasena />,
          },
        ],
      },
    ],
  },
  {
    element: <RutaProtegida />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: RUTAS.panel, element: <PaginaPanel /> },
          { path: RUTAS.proyectos, element: <PaginaProyectos /> },
          { path: RUTAS.proyectoPatron, element: <PaginaDetalleProyecto /> },
          { path: RUTAS.tareas, element: <PaginaTareas /> },
          { path: RUTAS.tablero, element: <PaginaTablero /> },
          { path: RUTAS.perfil, element: <PaginaPerfil /> },
        ],
      },
    ],
  },
  { path: '*', element: <PaginaNoEncontrada /> },
]