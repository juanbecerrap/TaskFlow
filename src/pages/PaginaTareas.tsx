import { useMemo, useState } from 'react'
import { ListChecks, Search } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import { useProyectos } from '../features/proyectos/useProyectos'
import {
  filtrarTareas,
  FILTROS_TAREAS_INICIALES,
  type FiltroEstadoTarea,
  type FiltroPrioridad,
  type FiltrosTareas,
  type OrdenTareas,
} from '../features/tareas/filtros'
import { ListaTareas } from '../features/tareas/ListaTareas'
import { useTareas } from '../features/tareas/useTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { RUTAS } from '../routes/rutas'

export function PaginaTareas() {
  useTituloDocumento('Tareas')
  const { tareas, cargando, error } = useTareas()
  const { proyectos } = useProyectos()
  const [filtros, setFiltros] = useState<FiltrosTareas>(FILTROS_TAREAS_INICIALES)

  const nombresProyecto = useMemo(
    () => Object.fromEntries(proyectos.map((proyecto) => [proyecto.id, proyecto.nombre])),
    [proyectos],
  )
  const visibles = useMemo(() => filtrarTareas(tareas, filtros), [tareas, filtros])

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando tareas…" />
    if (error) return <MensajeError mensaje={error} />

    if (tareas.length === 0) {
      return (
        <div className="tf-card">
          <EstadoVacio
            icono={ListChecks}
            titulo="Aún no tienes tareas"
            descripcion="Las tareas se crean dentro de un proyecto. Abre uno y añade la primera."
          >
            <Link to={RUTAS.proyectos} className="btn btn-primary">
              Ir a proyectos
            </Link>
          </EstadoVacio>
        </div>
      )
    }

    return (
      <>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label htmlFor="buscar-tareas" className="form-label">
              Buscar tareas
            </label>
            <input
              id="buscar-tareas"
              type="search"
              className="form-control"
              placeholder="Título o descripción"
              value={filtros.texto}
              onChange={(evento) => setFiltros({ ...filtros, texto: evento.target.value })}
            />
          </div>
          <div className="col-sm-4 col-md-2">
            <label htmlFor="filtro-estado-tarea" className="form-label">
              Estado
            </label>
            <select
              id="filtro-estado-tarea"
              className="form-select"
              value={filtros.estado}
              onChange={(evento) =>
                setFiltros({ ...filtros, estado: evento.target.value as FiltroEstadoTarea })
              }
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div className="col-sm-4 col-md-3">
            <label htmlFor="filtro-prioridad" className="form-label">
              Prioridad
            </label>
            <select
              id="filtro-prioridad"
              className="form-select"
              value={filtros.prioridad}
              onChange={(evento) =>
                setFiltros({ ...filtros, prioridad: evento.target.value as FiltroPrioridad })
              }
            >
              <option value="todas">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="col-sm-4 col-md-3">
            <label htmlFor="orden-tareas" className="form-label">
              Ordenar por
            </label>
            <select
              id="orden-tareas"
              className="form-select"
              value={filtros.orden}
              onChange={(evento) =>
                setFiltros({ ...filtros, orden: evento.target.value as OrdenTareas })
              }
            >
              <option value="reciente">Más recientes</option>
              <option value="fecha">Fecha límite</option>
              <option value="prioridad">Prioridad (alta primero)</option>
            </select>
          </div>
        </div>

        <p role="status" className="text-body-secondary small">
          Mostrando {visibles.length} de {tareas.length}{' '}
          {tareas.length === 1 ? 'tarea' : 'tareas'}
        </p>

        {visibles.length === 0 ? (
          <div className="tf-card">
            <EstadoVacio
              icono={Search}
              titulo="Ninguna tarea coincide"
              descripcion="Prueba con otra búsqueda o cambia los filtros."
            >
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setFiltros(FILTROS_TAREAS_INICIALES)}
              >
                Limpiar filtros
              </button>
            </EstadoVacio>
          </div>
        ) : (
          <ListaTareas tareas={visibles} nombresProyecto={nombresProyecto} />
        )}
      </>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-4">Tareas</h1>
      {contenido()}
    </section>
  )
}