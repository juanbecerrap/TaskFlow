import {
  Columns3,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  User,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router'
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
    </>
  )
}