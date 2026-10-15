import { FirebaseError } from 'firebase/app'

const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Inténtalo de nuevo.'
const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos.'

const MENSAJES: Record<string, string> = {
  'auth/invalid-credential': MENSAJE_CREDENCIALES,
  'auth/wrong-password': MENSAJE_CREDENCIALES,
  'auth/user-not-found': MENSAJE_CREDENCIALES,
  'auth/invalid-email': 'El correo no es válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  'auth/too-many-requests':
    'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed':
    'No hay conexión con el servidor. Revisa tu internet.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unavailable: 'El servicio no está disponible ahora. Inténtalo más tarde.',
}

export function mensajeErrorAuth(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MENSAJES[error.code] ?? MENSAJE_GENERICO
  }
  return MENSAJE_GENERICO
}