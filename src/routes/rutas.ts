export const RUTAS = {
  inicio: '/',
  iniciarSesion: '/iniciar-sesion',
  registro: '/registro',
  recuperarContrasena: '/recuperar-contrasena',
  panel: '/panel',
  proyectos: '/proyectos',
  proyectoPatron: '/proyectos/:id',
  proyecto: (id: string) => `/proyectos/${id}`,
  tareas: '/tareas',
  tablero: '/tablero',
  perfil: '/perfil',
} as const