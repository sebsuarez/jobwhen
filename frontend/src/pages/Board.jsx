// pages/Board.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import '../styles/Board.css'

const COLUMNS = [
  {id: 'wishlist', label: 'Wishlist' },
  {id: 'applied', label: 'Applied' },
  {id: 'interview', label: 'Interview' },
  {id: 'offer', label: 'Offer' },
  {id: 'rejected', label: 'Rejected' },
  {id: 'ghosted', label: 'Ghosted' },
]

export default function Board() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="board__header">
          <div>
            <h1 className="page-title">Job Board</h1>
            <p className="page-subtitle">Drag cards between columns to update their status OR edit cards by clicking/tapping on them</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Add Job</Button>
        </div>
      </main>
    </div>
  )
}