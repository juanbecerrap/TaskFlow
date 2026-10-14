import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('entorno de pruebas', () => {
  it('renderiza un componente y usa los matchers de jest-dom', () => {
    render(<button type="button">Hola TaskFlow</button>)

    expect(
      screen.getByRole('button', { name: 'Hola TaskFlow' }),
    ).toBeInTheDocument()
  })
})