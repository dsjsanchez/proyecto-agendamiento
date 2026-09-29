import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Clients from './pages/Clients'
import Therapists from './pages/Therapists'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/citas" element={<Appointments />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/terapeutas" element={<Therapists />} />
        </Routes>
      </main>
    </div>
  )
}
