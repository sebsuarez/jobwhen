// pages/Collection.jsx
import Sidebar from '../components/Sidebar'
import { Link } from 'react-router-dom'

export default function Collection() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-collection"><h1>Collection & Badges</h1></div>
    </div>
  )
}