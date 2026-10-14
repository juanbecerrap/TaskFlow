import { ListChecks } from 'lucide-react'
import { Outlet } from 'react-router'
import './layout.css'

export function AuthLayout() {
  return (
    <div className="tf-auth">
      <main className="tf-auth__main" id="contenido-principal">
        <p className="tf-auth__brand">
          <span className="tf-placeholder__icon tf-auth__logo" aria-hidden="true">
            <ListChecks size={22} />
          </span>
          TaskFlow
        </p>
        <div className="tf-card tf-auth__card p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}