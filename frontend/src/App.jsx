// App.jsx
import { Navigate, Route, Routes } from 'react-router-dom'
import './styles/App.css'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import CompleteSignup from './pages/CompleteSignup'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Collection from './pages/Collection'
import Challenges from './pages/Challenges'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { useAuth } from './hooks/useAuth'

function AuthRedirect({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/signup" element={<AuthRedirect><SignUp /></AuthRedirect>} />
      <Route path="/complete-signup" element={<AuthRedirect><CompleteSignup /></AuthRedirect>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
      <Route path="/collection" element={<ProtectedRoute><Collection /></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
