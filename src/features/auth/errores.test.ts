import { FirebaseError } from 'firebase/app'
import { describe, expect, it } from 'vitest'
import { mensajeErrorAuth } from './errores'

describe('mensajeErrorAuth', () => {
  it('traduce códigos conocidos', () => {
    expect(
      mensajeErrorAuth(new FirebaseError('auth/email-already-in-use', 'x')),
    ).toBe('Ya existe una cuenta con ese correo.')
    expect(
      mensajeErrorAuth(new FirebaseError('auth/too-many-requests', 'x')),
    ).toBe('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.')
  })

  it('usa el mismo mensaje para contraseña incorrecta y cuenta inexistente', () => {
    const a = mensajeErrorAuth(new FirebaseError('auth/invalid-credential', 'x'))
    const b = mensajeErrorAuth(new FirebaseError('auth/wrong-password', 'x'))
    const c = mensajeErrorAuth(new FirebaseError('auth/user-not-found', 'x'))
    expect(a).toBe('Correo o contraseña incorrectos.')
    expect(b).toBe(a)
    expect(c).toBe(a)
  })

  it('usa un mensaje genérico para códigos desconocidos', () => {
    expect(mensajeErrorAuth(new FirebaseError('auth/algo-raro', 'x'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    )
  })

  it('usa un mensaje genérico para errores que no son de Firebase', () => {
    expect(mensajeErrorAuth(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    )
    expect(mensajeErrorAuth('texto')).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    )
  })
})