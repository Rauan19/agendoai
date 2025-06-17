import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from './components/ui/toaster'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ServicesPage from './pages/ServicesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App