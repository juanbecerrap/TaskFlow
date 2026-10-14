import { useEffect } from 'react'
import { Link } from 'react-router'
import { RUTAS } from '../../routes/rutas'

export function PaginaNoEncontrada() {
  useEffect(() => {
    document.title = 'Página no encontrada · TaskFlow'
  }, [])

  return (
    <main className="container py-5 text-center" id="contenido-principal">
      <h1 className="h3 mb-2">Página no encontrada</h1>
      <p className="text-body-secondary mb-4">
        La dirección que buscas no existe o fue movida.
      </p>
      <Link className="btn btn-primary" to={RUTAS.panel}>
        Ir al panel
      </Link>
    </main>
  )
}