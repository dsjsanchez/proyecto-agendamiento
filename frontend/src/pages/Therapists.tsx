import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api'
import type { Therapist } from '../types'

const emptyForm = { name: '', specialty: '', email: '', phone: '' }

export default function Therapists() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await api.get<Therapist[]>('/therapists')
    setTherapists(res.data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/therapists', {
        name: form.name,
        specialty: form.specialty,
        email: form.email,
        phone: form.phone || undefined,
      })
      setForm(emptyForm)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'No se pudo crear el terapeuta')
    }
  }

  if (loading) {
    return <p className="loading-text">Cargando terapeutas...</p>
  }

  return (
    <div>
      <h1 className="page-title">Terapeutas</h1>
      <p className="page-subtitle">Equipo profesional del centro de rehabilitacion</p>

      <div className="panel">
        <h2>Nuevo terapeuta</h2>
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
            Especialidad
            <input
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
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
          {error && <p className="form-error form-grid-full">{error}</p>}
          <button type="submit" className="btn-primary form-grid-full">
            Crear terapeuta
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Listado de terapeutas</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {therapists.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.specialty}</td>
                <td>{t.email}</td>
                <td>{t.phone ?? '-'}</td>
                <td>{t.active ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
            {therapists.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-row">
                  No hay terapeutas registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
