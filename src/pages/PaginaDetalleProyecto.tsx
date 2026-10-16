import { useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import { ModalConfirmacion } from '../components/common/ModalConfirmacion'
import { mensajeErrorAuth } from '../features/auth/errores'
import { useAuth } from '../features/auth/useAuth'
import { InsigniaEstado } from '../features/proyectos/InsigniaEstado'
import { ProyectoNoEncontrado } from '../features/proyectos/ProyectoNoEncontrado'
import {
  cambiarEstadoProyecto,
  eliminarProyecto,
} from '../features/proyectos/servicioProyectos'
import { useProyecto } from '../features/proyectos/useProyecto'
import { ListaTareas } from '../features/tareas/ListaTareas'
import { useTareas } from '../features/tareas/useTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { db } from '../lib/firebase'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../routes/rutas'

function Encabezado() {
  return <h1 className="h3 mb-4">Detalle de proyecto</h1>
}

export function PaginaDetalleProyecto() {
  const { id = '' } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const { proyecto, cargando, error, noEncontrado } = useProyecto(id)
  const {
    tareas,
    cargando: cargandoTareas,
    error: errorTareas,
  } = useTareas(id)
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')

  useTituloDocumento(proyecto?.nombre ?? 'Detalle de proyecto')

  async function alternarEstado() {
    if (!proyecto) return
    setErrorAccion('')
    setCambiandoEstado(true)
    try {
      await cambiarEstadoProyecto(
        db,
        proyecto.id,
        proyecto.estado === 'activo' ? 'archivado' : 'activo',
      )
    } catch (fallo) {
      setErrorAccion(mensajeErrorAuth(fallo))
    } finally {
      setCambiandoEstado(false)
    }
  }

  async function eliminar() {
    if (!proyecto || !usuario) return
    setErrorAccion('')
    setEliminando(true)
    try {
      await eliminarProyecto(db, usuario.uid, proyecto.id)
      navegar(RUTAS.proyectos)
    } catch (fallo) {
      setErrorAccion(mensajeErrorAuth(fallo))
      setEliminando(false)
      setConfirmando(false)
    }
  }

  if (cargando) {
    return (
      <section>
        <Encabezado />
        <IndicadorCarga texto="Cargando proyecto…" />
      </section>
    )
  }

  // Al borrar, Firestore confirma el borrado local antes de terminar: se evita
  // mostrar "no encontrado" durante ese instante.
  if (eliminando && !proyecto) {
    return (
      <section>
        <Encabezado />
        <IndicadorCarga texto="Eliminando proyecto…" />
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <Encabezado />
        <MensajeError mensaje={error} />
      </section>
    )
  }

  if (noEncontrado || !proyecto) {
    return (
      <section>
        <Encabezado />
        <ProyectoNoEncontrado />
      </section>
    )
  }

  const archivado = proyecto.estado === 'archivado'

  function contenidoTareas() {
    if (cargandoTareas) return <IndicadorCarga texto="Cargando tareas…" />
    if (errorTareas) return <MensajeError mensaje={errorTareas} />
    if (tareas.length === 0) {
      return (
        <div className="tf-card">
          <EstadoVacio
            icono={ListChecks}
            titulo="Este proyecto aún no tiene tareas"
            descripcion="Añade la primera con el botón «Nueva tarea»."
          />
        </div>
      )
    }
    return <ListaTareas tareas={tareas} />
  }

  return (
    <section>
      <p className="mb-3">
        <Link to={RUTAS.proyectos} className="d-inline-flex align-items-center gap-1">
          <ArrowLeft aria-hidden="true" size={16} />
          Volver a proyectos
        </Link>
      </p>

      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-2">{proyecto.nombre}</h1>
          <InsigniaEstado estado={proyecto.estado} />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link
            to={RUTAS.editarProyecto(proyecto.id)}
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          >
            <Pencil aria-hidden="true" size={18} />
            Editar
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            onClick={alternarEstado}
            disabled={cambiandoEstado}
          >
            {archivado ? (
              <ArchiveRestore aria-hidden="true" size={18} />
            ) : (
              <Archive aria-hidden="true" size={18} />
            )}
            {archivado ? 'Reactivar' : 'Archivar'}
          </button>
          <button
            type="button"
            className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
            onClick={() => setConfirmando(true)}
          >
            <Trash2 aria-hidden="true" size={18} />
            Eliminar
          </button>
        </div>
      </div>

      {errorAccion && (
        <div className="mb-3">
          <MensajeError mensaje={errorAccion} />
        </div>
      )}

      <div className="tf-card p-4">
        <h2 className="h5">Descripción</h2>
        <p className="mb-3">
          {proyecto.descripcion || (
            <span className="text-body-secondary">Sin descripción.</span>
          )}
        </p>
        <p className="text-body-secondary small mb-0">
          Creado el {formatearFecha(proyecto.creadoEn.toDate())} · Actualizado el{' '}
          {formatearFecha(proyecto.actualizadoEn.toDate())}
        </p>
      </div>

      <section aria-labelledby="titulo-tareas" className="mt-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <h2 id="titulo-tareas" className="h5 mb-0">
            Tareas
          </h2>
          <Link
            to={RUTAS.nuevaTarea(proyecto.id)}
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
          >
            <Plus aria-hidden="true" size={16} />
            Nueva tarea
          </Link>
        </div>
        {contenidoTareas()}
      </section>

      <ModalConfirmacion
        abierto={confirmando}
        titulo="Eliminar proyecto"
        mensaje={`Se eliminará «${proyecto.nombre}» y todas sus tareas. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={eliminar}
        onCancelar={() => setConfirmando(false)}
      />
    </section>
  )
}