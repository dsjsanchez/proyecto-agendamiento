export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  birth_date?: string
  notes?: string
  created_at: string
}

export interface Therapist {
  id: string
  name: string
  specialty: string
  email: string
  phone?: string
  active: boolean
  created_at: string
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  reason?: string
  notes?: string
  cancellation_reason?: string
  cancelled_at?: string
  created_at: string
  client: Client
  therapist: Therapist
}

export interface SummaryStats {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  no_show: number
  cancellation_rate: number
}

export interface StatusCount {
  status: string
  count: number
}

export interface DayCount {
  date: string
  count: number
}

export interface TherapistCount {
  therapist_id: string
  therapist_name: string
  total: number
  completed: number
  cancelled: number
}
