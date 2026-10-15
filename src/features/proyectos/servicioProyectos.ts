import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import type { EstadoProyecto, Proyecto } from '../../types/modelos'
import type { DatosProyecto } from './esquemas'

// Límite de operaciones por lote de escritura en Firestore.
const TAMANO_LOTE = 500

export function aProyecto(documento: DocumentSnapshot): Proyecto {
  // 'estimate' evita fechas nulas mientras el servidor confirma una escritura.
  const datos = documento.data({ serverTimestamps: 'estimate' }) as Omit<
    Proyecto,
    'id'
  >
  return { ...datos, id: documento.id }
}

export async function crearProyecto(
  db: Firestore,
  uid: string,
  datos: DatosProyecto,
): Promise<string> {
  const referencia = await addDoc(collection(db, 'projects'), {
    ownerId: uid,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    estado: 'activo',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  return referencia.id
}

export async function actualizarProyecto(
  db: Firestore,
  id: string,
  datos: DatosProyecto,
) {
  await updateDoc(doc(db, 'projects', id), {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    actualizadoEn: serverTimestamp(),
  })
}

export async function cambiarEstadoProyecto(
  db: Firestore,
  id: string,
  estado: EstadoProyecto,
) {
  await updateDoc(doc(db, 'projects', id), {
    estado,
    actualizadoEn: serverTimestamp(),
  })
}

// Borra primero las tareas (en lotes) y al final el proyecto: si algo falla a
// mitad, el proyecto sigue existiendo y se puede reintentar.
export async function eliminarProyecto(db: Firestore, uid: string, id: string) {
  const tareas = await getDocs(
    query(
      collection(db, 'tasks'),
      where('ownerId', '==', uid),
      where('projectId', '==', id),
    ),
  )
  const referencias = tareas.docs.map((tarea) => tarea.ref)

  for (let inicio = 0; inicio < referencias.length; inicio += TAMANO_LOTE) {
    const lote = writeBatch(db)
    for (const referencia of referencias.slice(inicio, inicio + TAMANO_LOTE)) {
      lote.delete(referencia)
    }
    await lote.commit()
  }

  await deleteDoc(doc(db, 'projects', id))
}

export function suscribirProyectos(
  db: Firestore,
  uid: string,
  alRecibir: (proyectos: Proyecto[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  const consulta = query(
    collection(db, 'projects'),
    where('ownerId', '==', uid),
    orderBy('actualizadoEn', 'desc'),
  )
  return onSnapshot(
    consulta,
    (instantanea) => alRecibir(instantanea.docs.map(aProyecto)),
    alFallar,
  )
}