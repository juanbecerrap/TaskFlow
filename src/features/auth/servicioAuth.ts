import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'
import type {
  DatosInicioSesion,
  DatosRecuperacion,
  DatosRegistro,
} from './esquemas'

export async function iniciarSesion({ correo, contrasena }: DatosInicioSesion) {
  await signInWithEmailAndPassword(auth, correo, contrasena)
}

export async function registrarUsuario({
  nombre,
  correo,
  contrasena,
}: DatosRegistro) {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena)
  await updateProfile(credencial.user, { displayName: nombre })
  await setDoc(doc(db, 'users', credencial.user.uid), {
    nombre,
    correo,
    creadoEn: serverTimestamp(),
  })
}

export async function cerrarSesion() {
  await signOut(auth)
}

export async function enviarCorreoRecuperacion({ correo }: DatosRecuperacion) {
  await sendPasswordResetEmail(auth, correo)
}