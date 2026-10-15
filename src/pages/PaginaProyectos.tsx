import { useMemo, useState } from 'react'
import { FolderKanban, Plus, Search } from 'lucide-react'
import { Link } from 'react-router'
import '../components/common/common.css'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import {
  filtrarProyectos,
  FILTROS_INICIALES,
  type Filtros,
  type FiltroEstado,
} from '../features/proyectos/filtros'
import { InsigniaEstado } from '../features/proyectos/InsigniaEstado'
import { useProyectos } from '../features/proyectos/useProyectos'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../routes/rutas'

export function PaginaProyectos() {
  useTituloDocumento('Proyectos')
  const { proyectos, cargando, error } = useProyectos()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const visibles = useMemo(
    () => filtrarProyectos(proyectos, filtros),
    [proyectos, filtros],
  )

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando proyectos…" />
    if (error) return <MensajeError mensaje={error} />

    if (proyectos.length === 0) {
      return (
        <div className="tf-card">
          <EstadoVacio
            icono={FolderKanban}
            titulo="Aún no tienes proyectos"
            descripcion="Crea tu primer proyecto para empezar a organizar tus tareas."
          >
            <Link to={RUTAS.nuevoProyecto} className="btn btn-primary">
              Crear proyecto
            </Link>
          </EstadoVacio>
        </div>
      )
    }

    return (
      <>
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <label htmlFor="buscar-proyectos" className="form-label">
              Buscar proyectos
            </label>
            <input
              id="buscar-proyectos"
              type="search"
              className="form-control"
              placeholder="Nombre o descripción"
              value={filtros.texto}
              onChange={(evento) =>
                setFiltros({ ...filtros, texto: evento.target.value })
              }
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="filtro-estado" className="form-label">
              Estado
            </label>
            <select
              id="filtro-estado"
              className="form-select"
              value={filtros.estado}
              onChange={(evento) =>
                setFiltros({ ...filtros, estado: evento.target.value as FiltroEstado })
              }
            >
              <option value="activo">Activos</option>
              <option value="archivado">Archivados</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>

        <p role="status" className="text-body-secondary small">
          Mostrando {visibles.length} de {proyectos.length}{' '}
          {proyectos.length === 1 ? 'proyecto' : 'proyectos'}
        </p>

        {visibles.length === 0 ? (
          <div className="tf-card">
            <EstadoVacio
              icono={Search}
              titulo="Ningún proyecto coincide"
              descripcion="Prueba con otra búsqueda o cambia el filtro de estado."
            >
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setFiltros(FILTROS_INICIALES)}
              >
                Limpiar filtros
              </button>
            </EstadoVacio>
          </div>
        ) : (
          <ul className="row g-3 list-unstyled mb-0">
            {visibles.map((proyecto) => (
              <li key={proyecto.id} className="col-md-6 col-xl-4">
                <article className="tf-card p-3 h-100 d-flex flex-column position-relative">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <h2 className="h5 mb-0">
                      <Link
                        to={RUTAS.proyecto(proyecto.id)}
                        className="stretched-link text-decoration-none"
                      >
                        {proyecto.nombre}
                      </Link>
                    </h2>
                    <InsigniaEstado estado={proyecto.estado} />
                  </div>
                  <p className="text-body-secondary tf-clamp mb-3">
                    {proyecto.descripcion || 'Sin descripción'}
                  </p>
                  <p className="text-body-secondary small mt-auto mb-0">
                    Actualizado el {formatearFecha(proyecto.actualizadoEn.toDate())}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="h3 mb-0">Proyectos</h1>
        <Link
          to={RUTAS.nuevoProyecto}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus aria-hidden="true" size={18} />
          Nuevo proyecto
        </Link>
      </div>
      {contenido()}
    </section>
  )
}