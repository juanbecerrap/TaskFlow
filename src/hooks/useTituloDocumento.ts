import { useEffect } from 'react'

export function useTituloDocumento(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · TaskFlow`
  }, [titulo])
}