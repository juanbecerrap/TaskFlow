import { z } from 'zod'
import { textoAFecha } from '../../lib/fechas'
import { ESTADOS_TAREA, PRIORIDADES_TAREA } from '../../types/modelos'

// Los límites coinciden con los de firestore.rules.
export const esquemaTarea = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'Escribe el título de la tarea')
    .max(120, 'Usa como máximo 120 caracteres'),
  descripcion: z.string().trim().max(1000, 'Usa como máximo 1000 caracteres'),
  estado: z.enum(ESTADOS_TAREA),
  prioridad: z.enum(PRIORIDADES_TAREA),
  // 'AAAA-MM-DD' o vacío (sin fecha límite).
  fechaLimite: z
    .string()
    .refine((valor) => valor === '' || textoAFecha(valor) !== null, 'Elige una fecha válida'),
})

export type DatosTarea = z.infer<typeof esquemaTarea>