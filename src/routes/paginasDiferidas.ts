import { lazy } from 'react'

// Cada página se descarga solo cuando se visita por primera vez.
export const PaginaIniciarSesion = lazy(() =>
  import('../pages/auth/PaginaIniciarSesion').then((m) => ({ default: m.PaginaIniciarSesion })),
)
export const PaginaRecuperarContrasena = lazy(() =>
  import('../pages/auth/PaginaRecuperarContrasena').then((m) => ({
    default: m.PaginaRecuperarContrasena,
  })),
)
export const PaginaRegistro = lazy(() =>
  import('../pages/auth/PaginaRegistro').then((m) => ({ default: m.PaginaRegistro })),
)
export const PaginaDetalleProyecto = lazy(() =>
  import('../pages/PaginaDetalleProyecto').then((m) => ({ default: m.PaginaDetalleProyecto })),
)
export const PaginaEditarProyecto = lazy(() =>
  import('../pages/PaginaEditarProyecto').then((m) => ({ default: m.PaginaEditarProyecto })),
)
export const PaginaEditarTarea = lazy(() =>
  import('../pages/PaginaEditarTarea').then((m) => ({ default: m.PaginaEditarTarea })),
)
export const PaginaNuevaTarea = lazy(() =>
  import('../pages/PaginaNuevaTarea').then((m) => ({ default: m.PaginaNuevaTarea })),
)
export const PaginaNuevoProyecto = lazy(() =>
  import('../pages/PaginaNuevoProyecto').then((m) => ({ default: m.PaginaNuevoProyecto })),
)
export const PaginaPanel = lazy(() =>
  import('../pages/PaginaPanel').then((m) => ({ default: m.PaginaPanel })),
)
export const PaginaPerfil = lazy(() =>
  import('../pages/PaginaPerfil').then((m) => ({ default: m.PaginaPerfil })),
)
export const PaginaProyectos = lazy(() =>
  import('../pages/PaginaProyectos').then((m) => ({ default: m.PaginaProyectos })),
)
export const PaginaTablero = lazy(() =>
  import('../pages/PaginaTablero').then((m) => ({ default: m.PaginaTablero })),
)
export const PaginaTareas = lazy(() =>
  import('../pages/PaginaTareas').then((m) => ({ default: m.PaginaTareas })),
)