import type { AppointmentStatus } from './types'

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistio',
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: '#2563eb',
  completed: '#16a34a',
  cancelled: '#dc2626',
  no_show: '#d97706',
}
