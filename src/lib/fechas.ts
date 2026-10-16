import type { Timestamp } from 'firebase/firestore'
import type { Tarea } from '../types/modelos'

// Convierte 'AAAA-MM-DD' en una fecha local a las 12:00 (evita saltos de día
// por zona horaria). Devuelve null si el texto no es una fecha real.
export function textoAFecha(texto: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  if (!partes) return null
  const anio = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const fecha = new Date(anio, mes - 1, dia, 12)
  const coincide =
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  return coincide ? fecha : null
}

// Inversa de textoAFecha, para rellenar <input type="date">.
export function fechaATexto(fecha: Timestamp | null): string {
  if (!fecha) return ''
  const d = fecha.toDate()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Vencida: tiene fecha límite anterior a hoy y no está completada.
export function estaVencida(
  tarea: Pick<Tarea, 'estado' | 'fechaLimite'>,
  ahora: Date = new Date(),
): boolean {
  if (!tarea.fechaLimite || tarea.estado === 'completada') return false
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  return tarea.fechaLimite.toDate() < inicioHoy
}