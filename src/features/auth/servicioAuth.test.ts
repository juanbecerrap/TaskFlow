import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { setDoc } from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cerrarSesion,
  enviarCorreoRecuperacion,
  iniciarSesion,
  registrarUsuario,
} from './servicioAuth'

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, ...ruta: string[]) => ({ ruta: ruta.join('/') })),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'MARCA_SERVIDOR'),
}))

beforeEach(() => {
  vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
    user: { uid: 'u1' },
  } as never)
})

describe('servicioAuth', () => {
  it('registrarUsuario crea la cuenta, guarda el nombre y el perfil', async () => {
    await registrarUsuario({
      nombre: 'Ana Pérez',
      correo: 'ana@correo.com',
      contrasena: 'Clave1234',
      confirmacion: 'Clave1234',
    })

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'ana@correo.com',
      'Clave1234',
    )
    expect(updateProfile).toHaveBeenCalledWith(
      { uid: 'u1' },
      { displayName: 'Ana Pérez' },
    )
    // El perfil nunca guarda contraseñas.
    expect(setDoc).toHaveBeenCalledWith(
      { ruta: 'users/u1' },
      { nombre: 'Ana Pérez', correo: 'ana@correo.com', creadoEn: 'MARCA_SERVIDOR' },
    )
  })

  it('registrarUsuario no escribe el perfil si falla la creación de la cuenta', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
      new Error('falla'),
    )

    await expect(
      registrarUsuario({
        nombre: 'Ana Pérez',
        correo: 'ana@correo.com',
        contrasena: 'Clave1234',
        confirmacion: 'Clave1234',
      }),
    ).rejects.toThrow('falla')
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('iniciarSesion usa correo y contraseña', async () => {
    await iniciarSesion({ correo: 'ana@correo.com', contrasena: 'Clave1234' })
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'ana@correo.com',
      'Clave1234',
    )
  })

  it('cerrarSesion cierra la sesión', async () => {
    await cerrarSesion()
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('enviarCorreoRecuperacion envía el correo indicado', async () => {
    await enviarCorreoRecuperacion({ correo: 'ana@correo.com' })
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'ana@correo.com',
    )
  })
})