import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api'
import type { Client } from '../types'

const emptyForm = { name: '', email: '', phone: '', notes: '' }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await api.get<Client[]>('/clients')
    setClients(res.data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/clients', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      })
      setForm(emptyForm)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'No se pudo crear el cliente')
    }
  }

  if (loading) {
    return <p className="loading-text">Cargando clientes...</p>
  }

  return (
    <div>
      <h1 className="page-title">Clientes</h1>
      <p className="page-subtitle">Pacientes registrados en el centro</p>

      <div className="panel">
        <h2>Nuevo cliente</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Telefono
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="form-grid-full">
            Notas
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          {error && <p className="form-error form-grid-full">{error}</p>}
          <button type="submit" className="btn-primary form-grid-full">
            Crear cliente
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Listado de clientes</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone ?? '-'}</td>
                <td>{c.notes ?? '-'}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-row">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
