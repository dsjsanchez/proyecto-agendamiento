import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api'
import StatCard from '../components/StatCard'
import { STATUS_COLORS, STATUS_LABELS } from '../statusMeta'
import type { AppointmentStatus, DayCount, StatusCount, SummaryStats, TherapistCount } from '../types'

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [byStatus, setByStatus] = useState<StatusCount[]>([])
  const [byDay, setByDay] = useState<DayCount[]>([])
  const [byTherapist, setByTherapist] = useState<TherapistCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [summaryRes, statusRes, dayRes, therapistRes] = await Promise.all([
        api.get<SummaryStats>('/stats/summary'),
        api.get<StatusCount[]>('/stats/by-status'),
        api.get<DayCount[]>('/stats/by-day', { params: { days: 14 } }),
        api.get<TherapistCount[]>('/stats/by-therapist'),
      ])
      setSummary(summaryRes.data)
      setByStatus(statusRes.data)
      setByDay(dayRes.data)
      setByTherapist(therapistRes.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !summary) {
    return <p className="loading-text">Cargando estadisticas...</p>
  }

  const dayChartData = byDay.map((d) => ({
    date: d.date.slice(5),
    citas: d.count,
  }))

  const statusChartData = byStatus.map((s) => ({
    name: STATUS_LABELS[s.status as AppointmentStatus] ?? s.status,
    value: s.count,
    status: s.status,
  }))

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Resumen general del centro de rehabilitacion</p>

      <div className="stat-grid">
        <StatCard label="Total de citas" value={summary.total} accent="blue" />
        <StatCard label="Agendadas" value={summary.scheduled} accent="blue" />
        <StatCard label="Completadas" value={summary.completed} accent="green" />
        <StatCard label="Canceladas" value={summary.cancelled} accent="red" />
        <StatCard label="Tasa de cancelacion" value={`${summary.cancellation_rate}%`} accent="amber" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2>Citas por dia (ultimos 14 dias)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="citas" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Distribucion por estado</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusChartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status as AppointmentStatus]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-wide">
          <h2>Citas por terapeuta</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byTherapist} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="therapist_name" width={160} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completadas" stackId="a" fill="#16a34a" />
              <Bar dataKey="cancelled" name="Canceladas" stackId="a" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
