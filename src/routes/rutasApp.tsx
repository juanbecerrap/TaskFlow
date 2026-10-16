import { Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { PaginaNoEncontrada } from '../components/common/PaginaNoEncontrada'
import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../components/layout/AuthLayout'
import {
  PaginaDetalleProyecto,
  PaginaEditarProyecto,
  PaginaEditarTarea,
  PaginaIniciarSesion,
  PaginaNuevaTarea,
  PaginaNuevoProyecto,
  PaginaPanel,
  PaginaPerfil,
  PaginaProyectos,
  PaginaRecuperarContrasena,
  PaginaRegistro,
  PaginaTablero,
  PaginaTareas,
} from './paginasDiferidas'
import { RUTAS } from './rutas'
import { RutaProtegida } from './RutaProtegida'
import { RutaSoloPublica } from './RutaSoloPublica'

function conCarga(pagina: ReactNode) {
  return <Suspense fallback={<IndicadorCarga texto="Cargando…" />}>{pagina}</Suspense>
}

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
          { path: RUTAS.iniciarSesion, element: conCarga(<PaginaIniciarSesion />) },
          { path: RUTAS.registro, element: conCarga(<PaginaRegistro />) },
          {
            path: RUTAS.recuperarContrasena,
            element: conCarga(<PaginaRecuperarContrasena />),
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
          { path: RUTAS.panel, element: conCarga(<PaginaPanel />) },
          { path: RUTAS.proyectos, element: conCarga(<PaginaProyectos />) },
          { path: RUTAS.nuevoProyecto, element: conCarga(<PaginaNuevoProyecto />) },
          { path: RUTAS.proyectoPatron, element: conCarga(<PaginaDetalleProyecto />) },
          { path: RUTAS.editarProyectoPatron, element: conCarga(<PaginaEditarProyecto />) },
          { path: RUTAS.nuevaTareaPatron, element: conCarga(<PaginaNuevaTarea />) },
          { path: RUTAS.tareas, element: conCarga(<PaginaTareas />) },
          { path: RUTAS.editarTareaPatron, element: conCarga(<PaginaEditarTarea />) },
          { path: RUTAS.tablero, element: conCarga(<PaginaTablero />) },
          { path: RUTAS.perfil, element: conCarga(<PaginaPerfil />) },
        ],
      },
    ],
  },
  { path: '*', element: <PaginaNoEncontrada /> },
]