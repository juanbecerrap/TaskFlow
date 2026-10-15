import { z } from 'zod'

// Los límites coinciden con los de firestore.rules.
export const esquemaProyecto = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre del proyecto')
    .max(80, 'Usa como máximo 80 caracteres'),
  descripcion: z.string().trim().max(500, 'Usa como máximo 500 caracteres'),
})

export type DatosProyecto = z.infer<typeof esquemaProyecto>