// App.jsx
import { Routes, Route } from 'react-router-dom'
import './styles/App.css'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Collection from './pages/Collection'
import Challenges from './pages/Challenges'
import Friends from './pages/Friends'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/board" element={<Board />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App