interface StatCardProps {
  label: string
  value: string | number
  accent?: 'blue' | 'green' | 'red' | 'amber'
}

export default function StatCard({ label, value, accent = 'blue' }: StatCardProps) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
