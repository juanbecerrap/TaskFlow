import { ListChecks } from 'lucide-react'

function App() {
  return (
    <main className="container py-5">
      <section className="tf-card tf-placeholder mx-auto p-4 p-md-5 text-center">
        <span className="tf-placeholder__icon" aria-hidden="true">
          <ListChecks size={28} />
        </span>
        <h1 className="h3 mt-3 mb-2">TaskFlow</h1>
        <p className="text-body-secondary mb-0">
          Gestión de proyectos y tareas. Configuración inicial completada.
        </p>
      </section>
    </main>
  )
}

export default App