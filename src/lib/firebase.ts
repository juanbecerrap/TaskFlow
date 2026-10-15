import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const configuracion = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const faltantes = Object.entries(configuracion)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave)

if (faltantes.length > 0) {
  throw new Error(
    `Falta configurar Firebase en .env: ${faltantes.join(', ')}. ` +
      'Copia .env.example a .env y completa los valores.',
  )
}

export const app = initializeApp(configuracion)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}