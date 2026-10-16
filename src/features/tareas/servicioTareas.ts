import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import { textoAFecha } from '../../lib/fechas'
import type { EstadoTarea, Tarea } from '../../types/modelos'
import type { DatosTarea } from './esquemas'

export function aTarea(documento: DocumentSnapshot): Tarea {
  // 'estimate' evita fechas nulas mientras el servidor confirma una escritura.
  const datos = documento.data({ serverTimestamps: 'estimate' }) as Omit<Tarea, 'id'>
  return { ...datos, id: documento.id }
}

function aMarcaDeTiempo(texto: string): Timestamp | null {
  const fecha = textoAFecha(texto)
  return fecha ? Timestamp.fromDate(fecha) : null
}

export async function crearTarea(
  db: Firestore,
  uid: string,
  projectId: string,
  datos: DatosTarea,
): Promise<string> {
  const referencia = await addDoc(collection(db, 'tasks'), {
    ownerId: uid,
    projectId,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    estado: datos.estado,
    prioridad: datos.prioridad,
    fechaLimite: aMarcaDeTiempo(datos.fechaLimite),
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  return referencia.id
}

// ownerId, projectId y creadoEn no se envían: las reglas exigen que no cambien.
export async function actualizarTarea(db: Firestore, id: string, datos: DatosTarea) {
  await updateDoc(doc(db, 'tasks', id), {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    estado: datos.estado,
    prioridad: datos.prioridad,
    fechaLimite: aMarcaDeTiempo(datos.fechaLimite),
    actualizadoEn: serverTimestamp(),
  })
}

export async function cambiarEstadoTarea(db: Firestore, id: string, estado: EstadoTarea) {
  await updateDoc(doc(db, 'tasks', id), {
    estado,
    actualizadoEn: serverTimestamp(),
  })
}

export async function eliminarTarea(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'tasks', id))
}

// Todas las tareas del usuario (para Tareas, Tablero y el panel).
export function suscribirTareas(
  db: Firestore,
  uid: string,
  alRecibir: (tareas: Tarea[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  const consulta = query(
    collection(db, 'tasks'),
    where('ownerId', '==', uid),
    orderBy('actualizadoEn', 'desc'),
  )
  return onSnapshot(
    consulta,
    (instantanea) => alRecibir(instantanea.docs.map(aTarea)),
    alFallar,
  )
}

// Solo las tareas de un proyecto (para el detalle del proyecto).
export function suscribirTareasDeProyecto(
  db: Firestore,
  uid: string,
  projectId: string,
  alRecibir: (tareas: Tarea[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  const consulta = query(
    collection(db, 'tasks'),
    where('ownerId', '==', uid),
    where('projectId', '==', projectId),
    orderBy('actualizadoEn', 'desc'),
  )
  return onSnapshot(
    consulta,
    (instantanea) => alRecibir(instantanea.docs.map(aTarea)),
    alFallar,
  )
}