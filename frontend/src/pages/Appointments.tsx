import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api'
import { STATUS_LABELS } from '../statusMeta'
import type { Appointment, AppointmentStatus, Client, Therapist } from '../types'

const emptyForm = {
  client_id: '',
  therapist_id: '',
  start_time: '',
  end_time: '',
  reason: '',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadAppointments(status?: string) {
    const res = await api.get<Appointment[]>('/appointments', {
      params: status ? { status } : {},
    })
    setAppointments(res.data)
  }

  useEffect(() => {
    async function loadAll() {
      const [clientsRes, therapistsRes] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<Therapist[]>('/therapists'),
      ])
      setClients(clientsRes.data)
      setTherapists(therapistsRes.data)
      await loadAppointments()
      setLoading(false)
    }
    loadAll()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadAppointments(statusFilter || undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/appointments', {
        client_id: form.client_id,
        therapist_id: form.therapist_id,
        start_time: form.start_time,
        end_time: form.end_time,
        reason: form.reason || undefined,
      })
      setForm(emptyForm)
      await loadAppointments(statusFilter || undefined)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'No se pudo agendar la cita')
    }
  }

  async function handleCancel(id: string) {
    const reason = window.prompt('Motivo de la cancelacion (opcional):') ?? undefined
    await api.patch(`/appointments/${id}/cancel`, { reason })
    await loadAppointments(statusFilter || undefined)
  }

  if (loading) {
    return <p className="loading-text">Cargando citas...</p>
  }

  return (
    <div>
      <h1 className="page-title">Citas</h1>
      <p className="page-subtitle">Agenda, revisa y cancela citas del centro</p>

      <div className="panel">
        <h2>Nueva cita</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Cliente
            <select
              required
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Terapeuta
            <select
              required
              value={form.therapist_id}
              onChange={(e) => setForm({ ...form, therapist_id: e.target.value })}
            >
              <option value="">Selecciona un terapeuta</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.specialty}
                </option>
              ))}
            </select>
          </label>

          <label>
            Inicio
            <input
              type="datetime-local"
              required
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </label>

          <label>
            Termino
            <input
              type="datetime-local"
              required
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </label>

          <label className="form-grid-full">
            Motivo
            <input
              type="text"
              placeholder="Ej: Dolor lumbar"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>

          {error && <p className="form-error form-grid-full">{error}</p>}

          <button type="submit" className="btn-primary form-grid-full">
            Agendar cita
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Listado de citas</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Terapeuta</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>
                  {new Date(appt.start_time).toLocaleString('es-CL', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>
                <td>{appt.client.name}</td>
                <td>{appt.therapist.name}</td>
                <td>{appt.reason ?? '-'}</td>
                <td>
                  <span className={`badge badge-${appt.status}`}>
                    {STATUS_LABELS[appt.status as AppointmentStatus]}
                  </span>
                </td>
                <td>
                  {appt.status === 'scheduled' && (
                    <button className="btn-danger-outline" onClick={() => handleCancel(appt.id)}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  No hay citas para este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
