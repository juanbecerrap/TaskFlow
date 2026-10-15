import { describe, expect, it } from 'vitest'
import {
  esquemaInicioSesion,
  esquemaRecuperacion,
  esquemaRegistro,
} from './esquemas'

interface Resultado {
  error?: { issues: { path: PropertyKey[]; message: string }[] }
}

function mensajeDe(resultado: Resultado, campo: string) {
  return resultado.error?.issues.find((caso) => caso.path[0] === campo)?.message
}

const registroValido = {
  nombre: 'Ana Pérez',
  correo: 'ana@correo.com',
  contrasena: 'Clave1234',
  confirmacion: 'Clave1234',
}

describe('esquemas de autenticación', () => {
  it('inicio de sesión acepta datos válidos', () => {
    const resultado = esquemaInicioSesion.safeParse({
      correo: 'ana@correo.com',
      contrasena: 'cualquiera',
    })
    expect(resultado.success).toBe(true)
  })

  it('inicio de sesión rechaza correo inválido y contraseña vacía', () => {
    const resultado = esquemaInicioSesion.safeParse({
      correo: 'no-es-correo',
      contrasena: '',
    })
    expect(resultado.success).toBe(false)
    expect(mensajeDe(resultado, 'correo')).toBe('Escribe un correo válido')
    expect(mensajeDe(resultado, 'contrasena')).toBe('Escribe tu contraseña')
  })

  it('registro acepta datos válidos y recorta espacios', () => {
    const resultado = esquemaRegistro.safeParse({
      ...registroValido,
      nombre: '  Ana Pérez  ',
      correo: '  ana@correo.com ',
    })
    expect(resultado.success).toBe(true)
    expect(resultado.data?.nombre).toBe('Ana Pérez')
    expect(resultado.data?.correo).toBe('ana@correo.com')
  })

  it('registro rechaza una contraseña corta', () => {
    const resultado = esquemaRegistro.safeParse({
      ...registroValido,
      contrasena: 'Ab1',
      confirmacion: 'Ab1',
    })
    expect(mensajeDe(resultado, 'contrasena')).toBe('Usa al menos 8 caracteres')
  })

  it('registro exige letras y números', () => {
    const sinNumero = esquemaRegistro.safeParse({
      ...registroValido,
      contrasena: 'abcdefgh',
      confirmacion: 'abcdefgh',
    })
    expect(mensajeDe(sinNumero, 'contrasena')).toBe('Incluye al menos un número')

    const sinLetra = esquemaRegistro.safeParse({
      ...registroValido,
      contrasena: '12345678',
      confirmacion: '12345678',
    })
    expect(mensajeDe(sinLetra, 'contrasena')).toBe('Incluye al menos una letra')
  })

  it('registro rechaza una confirmación distinta', () => {
    const resultado = esquemaRegistro.safeParse({
      ...registroValido,
      confirmacion: 'Otra1234',
    })
    expect(resultado.success).toBe(false)
    expect(mensajeDe(resultado, 'confirmacion')).toBe(
      'Las contraseñas no coinciden',
    )
  })

  it('recuperación valida el correo', () => {
    expect(esquemaRecuperacion.safeParse({ correo: 'ana@correo.com' }).success).toBe(true)
    expect(esquemaRecuperacion.safeParse({ correo: '' }).success).toBe(false)
  })
})