import { useState } from 'react'
import {
  Columns3,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  User,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { mensajeErrorAuth } from '../../features/auth/errores'
import { cerrarSesion } from '../../features/auth/servicioAuth'
import { useAuth } from '../../features/auth/useAuth'
import { RUTAS } from '../../routes/rutas'

const ENLACES = [
  { a: RUTAS.panel, texto: 'Panel', Icono: LayoutDashboard },
  { a: RUTAS.proyectos, texto: 'Proyectos', Icono: FolderKanban },
  { a: RUTAS.tareas, texto: 'Tareas', Icono: ListChecks },
  { a: RUTAS.tablero, texto: 'Tablero', Icono: Columns3 },
  { a: RUTAS.perfil, texto: 'Perfil', Icono: User },
] as const

interface SidebarProps {
  onNavegar: () => void
  onCerrar: () => void
}

export function Sidebar({ onNavegar, onCerrar }: SidebarProps) {
  const { usuario } = useAuth()
  const [errorSesion, setErrorSesion] = useState('')

  // Al cerrar sesión, RutaProtegida lleva a iniciar sesión.
  async function alCerrarSesion() {
    setErrorSesion('')
    try {
      await cerrarSesion()
    } catch (error) {
      setErrorSesion(mensajeErrorAuth(error))
    }
  }

  return (
    <>
      <div className="tf-sidebar__header">
        <span className="tf-brand">
          <ListChecks aria-hidden="true" size={22} />
          TaskFlow
        </span>
        <button
          type="button"
          className="tf-icon-btn d-lg-none"
          onClick={onCerrar}
          aria-label="Cerrar menú"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </div>
      <nav aria-label="Navegación principal" className="tf-sidebar__nav">
        <ul className="list-unstyled m-0">
          {ENLACES.map(({ a, texto, Icono }) => (
            <li key={a}>
              <NavLink to={a} className="tf-nav-link" onClick={onNavegar}>
                <Icono aria-hidden="true" size={20} />
                <span>{texto}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="tf-sidebar__footer">
        {usuario?.email && (
          <p className="tf-sidebar__user" title={usuario.email}>
            {usuario.email}
          </p>
        )}
        <button
          type="button"
          className="tf-nav-link tf-nav-link--boton"
          onClick={alCerrarSesion}
        >
          <LogOut aria-hidden="true" size={20} />
          <span>Cerrar sesión</span>
        </button>
        {errorSesion && (
          <p role="alert" className="tf-sidebar__error">
            {errorSesion}
          </p>
        )}
      </div>
    </>
  )
}