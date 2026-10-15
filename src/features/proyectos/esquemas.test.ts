import { describe, expect, it } from 'vitest'
import { esquemaProyecto } from './esquemas'

interface Resultado {
  error?: { issues: { path: PropertyKey[]; message: string }[] }
}

function mensajeDe(resultado: Resultado, campo: string) {
  return resultado.error?.issues.find((caso) => caso.path[0] === campo)?.message
}

describe('esquemaProyecto', () => {
  it('acepta datos válidos y recorta espacios', () => {
    const resultado = esquemaProyecto.safeParse({
      nombre: '  Rediseño web  ',
      descripcion: '  Sitio nuevo ',
    })
    expect(resultado.success).toBe(true)
    expect(resultado.data).toEqual({
      nombre: 'Rediseño web',
      descripcion: 'Sitio nuevo',
    })
  })

  it('rechaza un nombre vacío o de solo espacios', () => {
    const vacio = esquemaProyecto.safeParse({ nombre: '', descripcion: '' })
    expect(mensajeDe(vacio, 'nombre')).toBe('Escribe el nombre del proyecto')

    const espacios = esquemaProyecto.safeParse({ nombre: '   ', descripcion: '' })
    expect(mensajeDe(espacios, 'nombre')).toBe('Escribe el nombre del proyecto')
  })

  it('rechaza un nombre de más de 80 caracteres', () => {
    const resultado = esquemaProyecto.safeParse({
      nombre: 'a'.repeat(81),
      descripcion: '',
    })
    expect(mensajeDe(resultado, 'nombre')).toBe('Usa como máximo 80 caracteres')
  })

  it('permite descripción vacía y rechaza más de 500 caracteres', () => {
    expect(esquemaProyecto.safeParse({ nombre: 'Uno', descripcion: '' }).success).toBe(true)

    const larga = esquemaProyecto.safeParse({
      nombre: 'Uno',
      descripcion: 'a'.repeat(501),
    })
    expect(mensajeDe(larga, 'descripcion')).toBe('Usa como máximo 500 caracteres')
  })
})