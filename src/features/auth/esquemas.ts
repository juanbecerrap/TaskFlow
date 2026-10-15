import { z } from 'zod'

const correo = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo electrónico')
  .pipe(z.email('Escribe un correo válido'))

const contrasenaNueva = z
  .string()
  .min(8, 'Usa al menos 8 caracteres')
  .max(128, 'Usa como máximo 128 caracteres')
  .regex(/[A-Za-z]/, 'Incluye al menos una letra')
  .regex(/\d/, 'Incluye al menos un número')

export const esquemaInicioSesion = z.object({
  correo,
  contrasena: z.string().min(1, 'Escribe tu contraseña'),
})

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'Escribe tu nombre (mínimo 2 caracteres)')
      .max(60, 'Usa como máximo 60 caracteres'),
    correo,
    contrasena: contrasenaNueva,
    confirmacion: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmacion'],
  })

export const esquemaRecuperacion = z.object({ correo })

export type DatosInicioSesion = z.infer<typeof esquemaInicioSesion>
export type DatosRegistro = z.infer<typeof esquemaRegistro>
export type DatosRecuperacion = z.infer<typeof esquemaRecuperacion>