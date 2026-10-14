import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import './layout.css'

export function AppShell() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const barraRef = useRef<HTMLElement>(null)

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  function cerrarYDevolverFoco() {
    setMenuAbierto(false)
    botonMenuRef.current?.focus()
  }

  // Al abrir el menú, el foco pasa al primer enlace.
  useEffect(() => {
    if (menuAbierto) {
      barraRef.current?.querySelector('a')?.focus()
    }
  }, [menuAbierto])

  // Escape cierra el menú.
  useEffect(() => {
    if (!menuAbierto) return
    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setMenuAbierto(false)
        botonMenuRef.current?.focus()
      }
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [menuAbierto])

  // Si la pantalla pasa a escritorio con el menú abierto, se cierra.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const consulta = window.matchMedia('(min-width: 992px)')
    function alCambiar(evento: MediaQueryListEvent) {
      if (evento.matches) setMenuAbierto(false)
    }
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return (
    <div className="tf-shell">
      <a className="tf-skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>

      <header className="tf-topbar d-lg-none">
        <button
          ref={botonMenuRef}
          type="button"
          className="tf-icon-btn"
          aria-label="Menú de navegación"
          aria-expanded={menuAbierto}
          aria-controls="barra-lateral"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <Menu aria-hidden="true" size={22} />
        </button>
        <span className="tf-brand">TaskFlow</span>
      </header>

      <aside
        id="barra-lateral"
        ref={barraRef}
        className={`tf-sidebar${menuAbierto ? ' tf-sidebar--abierta' : ''}`}
      >
        <Sidebar onNavegar={cerrarMenu} onCerrar={cerrarYDevolverFoco} />
      </aside>

      {menuAbierto && (
        <div
          className="tf-backdrop d-lg-none"
          aria-hidden="true"
          onClick={cerrarMenu}
        />
      )}

      <div className="tf-main">
        <main
          id="contenido-principal"
          tabIndex={-1}
          className="tf-main__inner"
          inert={menuAbierto}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}